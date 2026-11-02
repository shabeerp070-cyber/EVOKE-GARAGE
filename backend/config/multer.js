import multer from 'multer';

// Multer Memory Storage Configuration
// Completely in-memory buffer: Zero local disk writes, zero mkdirSync calls
// Safe and fully compliant with Vercel serverless environments
const storage = multer.memoryStorage();

// File filter (Only Images Allowed)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP image files are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});
