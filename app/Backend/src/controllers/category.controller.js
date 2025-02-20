import { Category } from "../models/category.model.js";
import { MasterDB } from "../models/MasterDB.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const createCategory = asyncHandler(async (req, res) => {
  const { storeId, categoryName, description } = req.body;

  const store = await MasterDB.findOne({ storeId });

  if (!store) {
    throw new ApiError(400, "Store not found");
  }

  if (!categoryName) {
    throw new ApiError(400, "Category Name and Description are required");
  }

  const newCategory = await Category.create({
    storeId,
    categoryName,
    description,
  });

  res
    .status(201)
    .json(new ApiResponse(200, newCategory, "Category created Successfully."));
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(400, "Category not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, category, "Category fetched Successfully."));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  
  if(!category) {
    throw new ApiError(400, "Category not found");
  }

  let { categoryName, description, isActive } = req.body;

  if (!categoryName) {
    categoryName = category.categoryName;
  }

  if (!description) {
    description = category.description;
  }

  if (!isActive) {
    isActive = category.isActive;
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    { categoryName, description, isActive },
    { new: true }
  );

  if (!updatedCategory) {
    throw new ApiError(400, "update unsucessfully");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedCategory, "Category updaed Successfully"));
});

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, deletedCategory, "Category Deleted Successfully")
      );
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new ApiError(500, "Something went wrong while deleteing category.");
  }
};

export const getAllCategories = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  
  const categories = await Category.find({ storeId });

  if (!categories) {
    throw new ApiError(404, "No Categories found for this store.");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        categories,
        "Categories are fetched Successfully based on Store"
      )
    );
})