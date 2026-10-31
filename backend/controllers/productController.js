import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Safely delete local uploaded file if it exists
 */
const cleanupOldFile = (imagePath) => {
  if (imagePath && imagePath.startsWith('/uploads/products/')) {
    const fullPath = path.join(__dirname, '..', imagePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.warn(`Could not delete file ${fullPath}:`, err.message);
      }
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
  try {
    const { name, category, price, description, stockStatus, compatibility, partNumber, isActive } = req.body;

    // Check if an image was uploaded via Multer, or an image URL was provided
    let image = '';
    if (req.file) {
      image = `/uploads/products/${req.file.filename}`;
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
    if (req.file) {
      cleanupOldFile(`/uploads/products/${req.file.filename}`);
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
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      if (req.file) cleanupOldFile(`/uploads/products/${req.file.filename}`);
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
      product.image = `/uploads/products/${req.file.filename}`;
      // Clean up previous uploaded image if different
      cleanupOldFile(oldImage);
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
    if (req.file) cleanupOldFile(`/uploads/products/${req.file.filename}`);
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

    // Clean up file from disk
    cleanupOldFile(imagePath);

    return res.status(200).json({
      success: true,
      message: 'Product successfully deleted from catalog.',
    });
  } catch (error) {
    next(error);
  }
};

