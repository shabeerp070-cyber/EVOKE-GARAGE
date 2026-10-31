import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';

export const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access. Authentication token required for atelier administrative operations.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'evoke_garage_atelier_master_jwt_secret_2026';
    const decoded = jwt.verify(token, secret);

    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin account associated with this session no longer exists.',
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('❌ [AUTH ERROR]:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired administrative token. Please log in again.',
    });
  }
};

