import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js"
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    app.listen(5000, () => {
        console.log(`Server started on port ${process.env.PORT}`);
    })
})
.catch((err) => console.log("MongoDB connection failed !!! ",err))