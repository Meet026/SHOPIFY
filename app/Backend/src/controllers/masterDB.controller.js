// import { MasterDB } from "../models/MasterDB.model.js";
// // import shopify from "../../../shopify.server.js"; // Import Shopify API instance
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/apiError.js";

//Controller to Fetch Store Details using Shopify Admin API
// export const fetchStoreDetails = asyncHandler(async (req, res) => {
//     try {

//         const session = res.locals.shopifySession; // Shopify session middleware
//         if (!session) {
//             throw new ApiError(401, "Unauthorized request");
//         }

//         const client = new shopify.api.clients.Rest({ session });
//         const response = await client.get({ path: "shop" }); // Fetch store details

//         const { name, domain, id, email, plan_name } = response.body.shop;

//         return res.status(200).json({
//             storeName: name,
//             shopifyDomain: domain,
//             storeId: id.toString(),
//             email: email,
//             plan: plan_name.toLowerCase(), // Convert plan to match schema
//         });


//     } catch (error) {
//         console.error("Error fetching store details:", error);
//         throw new ApiError(500, "Failed to fetch store details.");
//     }
// })

// export const fetchAndSaveStoreDetails = async (req, res) => {
//     try {
//       const session = res.locals.shopifySession;
//       if (!session) {
//         return res.status(401).json({ error: "Unauthorized request" });
//       }
  
//       const client = new shopify.api.clients.Rest({ session });
//       const response = await client.get({ path: "shop" });
  
//       const { name, domain, id, email, plan_name } = response.body.shop;
  
//       // Upsert the store data in MongoDB (insert if new, update if existing)
//       const store = await MasterDB.findOneAndUpdate(
//         { shopifyDomain: domain }, // Search by Shopify domain
//         {
//           storeName: name,
//           shopifyDomain: domain,
//           storeId: id.toString(),
//           email: email,
//           plan: plan_name.toLowerCase(),
//           isActive: true,
//           lastSynced: new Date(),
//         },
//         { upsert: true, new: true, setDefaultsOnInsert: true }
//       );
  
//       return res.status(200).json({
//         message: "Store details fetched and stored successfully.",
//         store,
//       });
//     } catch (error) {
//       console.error("Error fetching and storing store details:", error);
//       return res.status(500).json({ error: "Failed to fetch/store store details."});
//   }
//   };

// export const upsertStore = asyncHandler(async (req, res) => {
//     try {
//         const { storeName, shopifyDomain, storeId, email, plan } = req.body;

//         if (!storeName || !shopifyDomain || !storeId) {
//             throw new ApiError(400, "Missing required fields.")
//         }

//         const existingStore = await MasterDB.findOne({ shopifyDomain });

//         if (existingStore) {
//             existingStore.storeName = storeName;
//             existingStore.storeId = storeId;
//             existingStore.email = email || existingStore.email;
//             existingStore.plan = plan || existingStore.plan;
//             existingStore.isActive = true;
//             existingStore.lastSynced = new Date();

//             await existingStore.save();
//             return res.status(200).json({ message: "Store updated successfully.", store: existingStore });
//         } else {
//             const newStore = await MasterDB.create({
//                 storeName,
//                 shopifyDomain,
//                 storeId,
//                 email,
//                 plan,
//                 isActive: true,
//             });
//             return res.status(201).json({ message: "Store added successfully.", store: newStore });
//         }

//     } catch (error) {
//         console.error("Error upserting store:", error);
//         throw new ApiError(500, "Failed to upsert store.");
//     }
// })
// // Controller to Deactivate Store (On Uninstall)
// export const deactivateStore = asyncHandler(async (req, res) => {
//     try {

//         const { shopifyDomain } = req.body;

//         if (!shopifyDomain) {
//             throw new ApiError(400, "ShopifyDomain is required.")
//         }

//         const store = await MasterDB.findOneAndUpdate(
//             { shopifyDomain },
//             { isActive: false, lastSynced: new Date() },
//             { new: true }
//         );

//         if (!store) {
//             throw new ApiError(404, "Store not found.")
//         }

//         return res.status(200).json({ message: "Store deactivated.", store });

//     } catch (error) {
//         console.error("Error deactivating store:", error);
//     }
// })

// //Webhook: Handle App Uninstall (Automatically Deactivate Store)
// export const handleAppUninstall = asyncHandler(async (req, res) => {
//     try {
//         const shopifyDomain = req.body?.domain;

//         if (!shopifyDomain) {
//             throw new ApiError(400, "Invalid webhook data.")
//         }

//         await MasterDB.findOneAndUpdate(
//             { shopifyDomain },
//             { isActive: false, lastSynced: new Date() }
//         );

//         return res.status(200).send("App uninstalled. Store deactivated.");
//     } catch (error) {
//         console.error("Error handling app uninstall:", error);
//         throw new ApiError(500, "Failed to process uninstall.")
//     }
// })

// // Controller to Sync Store (Keep Details Updated)
// export const syncStore = asyncHandler(async (req, res) => {
//     try {

//         const { shopifyDomain } = req.body;

//         if (!shopifyDomain) {
//             throw new ApiError(400,"ShopifyDomain is required.")
//         }

//         const store = await MasterDB.findOneAndUpdate(
//             { shopifyDomain },
//             { lastSynced: new Date() },
//             { new: true }
//         );

//         if (!store) {
//             throw new ApiError(404,"Store not found.")
//         }

//         return res.status(200).json({ message: "Store synced successfully.", store });

//     } catch (error) {
//         console.error("Error syncing store:", error);
//         throw new ApiError(500,"Failed to sync store.")
//     }
// })

// // Controller to Fetch All Active Stores
// export const getAllActiveStores = asyncHandler(async(req,res) => {
//     try{
//         const stores = await MasterDB.find({ isActive: true });
//         return res.status(200).json({ stores });
//     }catch(error){
//         console.error("Error fetching active stores:", error);
//         throw new ApiError(500,"Failed to fetch active stores.")
//     }


import { MasterDB } from "../models/MasterDB.model.js";
import shopify from "../../../shopify.server.js"; // Import Shopify API instance
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { authenticate } from "../../../shopify.server.js";


// Middleware to verify Shopify authentication
// export const verifyShopifyAuth = async (req, res, next) => {
//     try {
//         const session = res.locals.shopifySession;
//         if (!session || !session.shop || !session.accessToken) {
//             return res.status(401).json({ error: "Unauthorized request. Please log in via Shopify OAuth." });
//         }
//         next();
//     } catch (error) {
//         console.error("Authentication Error:", error);
//         return res.status(401).json({ error: "Invalid session. Please reauthenticate." });
//     }
// };

export const verifyShopifySession = async (req, res, next) => {
    try {
        const { session } = await authenticate.admin(req, res);
        if (!session) {
            return res.status(401).json({ error: "Unauthorized: Missing session" });
        }
        res.locals.shopifySession = session; // Store session for controllers
        next();
    } catch (error) {
        console.error("Shopify Auth Error:", error);
        res.status(401).json({ error: "Authentication failed" });
    }
};

// Controller to Fetch & Store Store Details (OAuth Authenticated)
// export const fetchAndSaveStoreDetails = asyncHandler(async (req, res) => {
//         // const session = res.locals.shopifySession;
//         const session = await authenticate.admin(req);
//         if (!session) {
//             throw new ApiError(401, "Unauthorized request");
//         }

//         console.log("Session:", session);
        

//         const client = new shopify.api.clients.Rest({ session });
//         const response = await client.get({ path: "shop" });

//         const { name, domain, id, email, plan_name } = response.body.shop;

//         // Upsert Store Data in MongoDB
//         const store = await MasterDB.findOneAndUpdate(
//             { shopifyDomain: domain }, 
//             {
//                 storeName: name,
//                 shopifyDomain: domain,
//                 storeId: id.toString(),
//                 email: email,
//                 plan: plan_name.toLowerCase(),
//                 isActive: true,
//                 lastSynced: new Date(),
//             },
//             { upsert: true, new: true, setDefaultsOnInsert: true }
//         );

//         return res.status(200).json({
//             message: "Store details fetched and stored successfully.",
//             store,
//         });
  
// });

export const fetchAndSaveStoreDetails = asyncHandler(async (req, res) => {
        // Authenticate Admin before accessing Shopify API
        const { session } = await authenticate.admin(req);

        if (!session) {
            throw new ApiError(401, "Unauthorized request: Missing session");
        }

        // // Use authenticated Shopify session to fetch store details
        // const client = new shopify.api.clients.Rest({ session });
        // const response = await client.get({ path: "shop" });

        // if (!response.body || !response.body.shop) {
        //     throw new ApiError(500, "Failed to retrieve shop data.");
        // }

        // const { name, domain, id, email, plan_name } = response.body.shop;

        // Upsert store data in MongoDB
        const store = await MasterDB.findOneAndUpdate(
            { shopifyDomain: domain },
            {
                storeName: name,
                shopifyDomain: domain,
                storeId: id.toString(),
                email,
                plan: plan_name.toLowerCase(),
                isActive: true,
                lastSynced: new Date(),
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json({
            message: "Store details fetched and stored successfully.",
            store,
        });
});

// Controller to Upsert Store (Authenticated)
export const upsertStore = asyncHandler(async (req, res) => {
    try {
        const { storeName, shopifyDomain, storeId, email, plan } = req.body;

        if (!storeName || !shopifyDomain || !storeId) {
            throw new ApiError(400, "Missing required fields.");
        }

        const existingStore = await MasterDB.findOne({ shopifyDomain });

        if (existingStore) {
            existingStore.storeName = storeName;
            existingStore.storeId = storeId;
            existingStore.email = email || existingStore.email;
            existingStore.plan = plan || existingStore.plan;
            existingStore.isActive = true;
            existingStore.lastSynced = new Date();

            await existingStore.save();
            return res.status(200).json({ message: "Store updated successfully.", store: existingStore });
        } else {
            const newStore = await MasterDB.create({
                storeName,
                shopifyDomain,
                storeId,
                email,
                plan,
                isActive: true,
            });
            return res.status(201).json({ message: "Store added successfully.", store: newStore });
        }
    } catch (error) {
        console.error("Error upserting store:", error);
        throw new ApiError(500, "Failed to upsert store.");
    }
});

// Controller to Deactivate Store on Uninstall
export const deactivateStore = asyncHandler(async (req, res) => {
    try {
        const { shopifyDomain } = req.body;

        if (!shopifyDomain) {
            throw new ApiError(400, "ShopifyDomain is required.");
        }

        const store = await MasterDB.findOneAndUpdate(
            { shopifyDomain },
            { isActive: false, lastSynced: new Date() },
            { new: true }
        );

        if (!store) {
            throw new ApiError(404, "Store not found.");
        }

        return res.status(200).json({ message: "Store deactivated.", store });
    } catch (error) {
        console.error("Error deactivating store:", error);
        throw new ApiError(500, "Failed to deactivate store.");
    }
});

// Webhook: Handle App Uninstall (Automatically Deactivate Store)
export const handleAppUninstall = asyncHandler(async (req, res) => {
    try {
        const shopifyDomain = req.body?.domain;

        if (!shopifyDomain) {
            throw new ApiError(400, "Invalid webhook data.");
        }

        await MasterDB.findOneAndUpdate(
            { shopifyDomain },
            { isActive: false, lastSynced: new Date() }
        );

        return res.status(200).send("App uninstalled. Store deactivated.");
    } catch (error) {
        console.error("Error handling app uninstall:", error);
        throw new ApiError(500, "Failed to process uninstall.");
    }
});

// Controller to Sync Store (Keep Details Updated)
export const syncStore = asyncHandler(async (req, res) => {
    try {
        const { shopifyDomain } = req.body;

        if (!shopifyDomain) {
            throw new ApiError(400, "ShopifyDomain is required.");
        }

        const store = await MasterDB.findOneAndUpdate(
            { shopifyDomain },
            { lastSynced: new Date() },
            { new: true }
        );

        if (!store) {
            throw new ApiError(404, "Store not found.");
        }

        return res.status(200).json({ message: "Store synced successfully.", store });
    } catch (error) {
        console.error("Error syncing store:", error);
        throw new ApiError(500, "Failed to sync store.");
    }
});

// Controller to Fetch All Active Stores
export const getAllActiveStores = asyncHandler(async (req, res) => {
    try {
        const stores = await MasterDB.find({ isActive: true });
        return res.status(200).json({ stores });
    } catch (error) {
        console.error("Error fetching active stores:", error);
        throw new ApiError(500, "Failed to fetch active stores.");
    }
});
