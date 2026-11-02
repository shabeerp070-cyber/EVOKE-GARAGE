import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';
import {
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
  saveLocalFile,
} from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Safely delete image asset (Cloudinary asset in production, or local file in dev)
 */
const cleanupOldFile = async (imagePath) => {
  if (!imagePath) return;

  // Cloudinary image cleanup
  if (imagePath.includes('cloudinary.com') && isCloudinaryConfigured()) {
    try {
      await deleteFromCloudinary(imagePath);
    } catch (err) {
      console.warn('Could not delete Cloudinary asset:', err.message);
    }
    return;
  }

  // Local development file cleanup (only if local uploads folder exists)
  if (imagePath.startsWith('/uploads/products/')) {
    try {
      const fullPath = path.join(__dirname, '..', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.warn(`Could not delete local file ${imagePath}:`, err.message);
    }
  }
};

// ============================================================================
// PUBLIC PRODUCT APIS (Customer Website)
// ============================================================================

/**
 * @desc    Get all active products for public customer website
 * @route   GET /api/products
 * @access  Public
 */
export const getPublicProducts = async (req, res, next) => {
  try {
    const filter = { isActive: true };

    // Category filter
    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }

    // Search query filter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { partNumber: searchRegex },
        { compatibility: searchRegex },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getSingleProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or is currently inactive.',
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// ADMIN PRODUCT APIS (Protected via protectAdmin)
// ============================================================================

/**
 * @desc    Get all products for admin panel (active & inactive)
 * @route   GET /api/admin/products
 * @access  Private (Admin only)
 */
export const getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new product with image upload
 * @route   POST /api/admin/products
 * @access  Private (Admin only)
 */
export const createProduct = async (req, res, next) => {
  let uploadedImageUrl = '';
  try {
    const { name, category, price, description, stockStatus, compatibility, partNumber, isActive } = req.body;

    // Check if an image was uploaded via Multer, or an image URL was provided
    let image = '';
    if (req.file) {
      if (isCloudinaryConfigured()) {
        const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        image = uploadResult.secure_url;
        uploadedImageUrl = image;
      } else {
        // Fallback for local development when Cloudinary is not configured
        image = await saveLocalFile(req.file);
        uploadedImageUrl = image;
      }
    } else if (req.body.image) {
      image = req.body.image.trim();
    }

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide or upload a product image.',
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required.',
      });
    }

    if (!price || isNaN(Number(price))) {
      return res.status(400).json({
        success: false,
        message: 'Valid product price is required.',
      });
    }

    const product = await Product.create({
      name: name.trim(),
      category: category ? category.trim() : 'Exhaust & Downpipes',
      price: Number(price),
      description: description ? description.trim() : '',
      stockStatus: stockStatus || 'In Stock',
      compatibility: compatibility ? compatibility.trim() : 'High Performance Chassis',
      partNumber: partNumber ? partNumber.trim() : '',
      image,
      isActive: isActive === undefined ? true : Boolean(isActive === 'true' || isActive === true),
    });

    return res.status(201).json({
      success: true,
      message: 'Product successfully added to catalog.',
      product,
    });
  } catch (error) {
    // If error and file was uploaded, clean it up
    if (uploadedImageUrl) {
      cleanupOldFile(uploadedImageUrl);
    }
    next(error);
  }
};

/**
 * @desc    Update existing product with optional image replacement
 * @route   PUT /api/admin/products/:id
 * @access  Private (Admin only)
 */
export const updateProduct = async (req, res, next) => {
  let uploadedImageUrl = '';
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const { name, category, price, description, stockStatus, compatibility, partNumber, isActive } = req.body;

    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category.trim();
    if (price !== undefined && !isNaN(Number(price))) product.price = Number(price);
    if (description !== undefined) product.description = description.trim();
    if (stockStatus !== undefined) product.stockStatus = stockStatus;
    if (compatibility !== undefined) product.compatibility = compatibility.trim();
    if (partNumber !== undefined) product.partNumber = partNumber.trim();
    if (isActive !== undefined) product.isActive = Boolean(isActive === 'true' || isActive === true);

    // If new image file uploaded, replace old image
    if (req.file) {
      const oldImage = product.image;
      let newImage = '';
      if (isCloudinaryConfigured()) {
        const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        newImage = uploadResult.secure_url;
      } else {
        newImage = await saveLocalFile(req.file);
      }
      uploadedImageUrl = newImage;
      product.image = newImage;

      // Clean up previous uploaded image if different
      if (oldImage && oldImage !== newImage) {
        cleanupOldFile(oldImage);
      }
    } else if (req.body.image && req.body.image.trim()) {
      product.image = req.body.image.trim();
    }

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product successfully updated.',
      product: updatedProduct,
    });
  } catch (error) {
    if (uploadedImageUrl) {
      cleanupOldFile(uploadedImageUrl);
    }
    next(error);
  }
};

/**
 * @desc    Delete product from database & clean up asset
 * @route   DELETE /api/admin/products/:id
 * @access  Private (Admin only)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const imagePath = product.image;
    await Product.findByIdAndDelete(req.params.id);

    // Clean up file if applicable
    cleanupOldFile(imagePath);

    return res.status(200).json({
      success: true,
      message: 'Product successfully deleted from catalog.',
    });
  } catch (error) {
    next(error);
  }
};
