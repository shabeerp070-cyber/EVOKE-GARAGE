import express from 'express';
import { getPublicProducts, getSingleProduct } from '../controllers/productController.js';

const router = express.Router();

// GET /api/products - List all active car parts with optional category & search filter
router.get('/', getPublicProducts);

// GET /api/products/:id - Get details for a single active car part
router.get('/:id', getSingleProduct);

export default router;

