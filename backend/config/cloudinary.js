import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Check if Cloudinary credentials are fully provided
 */
export const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Initialize Cloudinary when environment variables are present
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Upload a memory Buffer directly to Cloudinary via stream
 * Zero local disk writes — completely safe for Vercel and Serverless environments
 * 
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} originalname - Original file name for sanitized naming
 * @param {string} folder - Cloudinary destination folder (default: 'evoke-garage/products')
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
export const uploadToCloudinary = (buffer, originalname = 'product', folder = 'evoke-garage/products') => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(
        new Error(
          'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
        )
      );
    }

    // Ensure Cloudinary is initialized in case env vars were loaded dynamically
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    const ext = path.extname(originalname);
    const cleanBase = path
      .basename(originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');
    const publicId = `prod_${Date.now()}_${cleanBase}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ],
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]:', error);
          return reject(new Error(error.message || 'Cloudinary upload failed'));
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete an image asset from Cloudinary by URL or public ID
 * 
 * @param {string} urlOrPublicId
 */
export const deleteFromCloudinary = async (urlOrPublicId) => {
  if (!urlOrPublicId || !isCloudinaryConfigured()) return;

  try {
    let publicId = urlOrPublicId;
    // Extract public_id if full URL passed: .../upload/v12345/evoke-garage/products/prod_123.jpg
    if (urlOrPublicId.includes('cloudinary.com')) {
      const parts = urlOrPublicId.split('/upload/');
      if (parts.length > 1) {
        const pathAfterUpload = parts[1].replace(/^v\d+\//, '');
        publicId = pathAfterUpload.replace(/\.[^/.]+$/, ''); // Strip extension
      }
    }

    await cloudinary.uploader.destroy(publicId, { invalidate: true });
  } catch (error) {
    console.warn('[Cloudinary Delete Warning]:', error.message);
  }
};

/**
 * Local fallback for development environment only when Cloudinary is not configured
 * Never executed in production or on Vercel
 * 
 * @param {object} file - Multer memory file { buffer, originalname }
 * @returns {Promise<string>} - Relative path `/uploads/products/${filename}`
 */
export const saveLocalFile = async (file) => {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (isServerless) {
    throw new Error('Local disk storage is disabled in serverless production. Please configure Cloudinary environment variables.');
  }

  const uploadDir = path.join(__dirname, '../uploads/products');
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    const uniqueName = `product-${Date.now()}-${cleanBase}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    await fs.promises.writeFile(filePath, file.buffer);
    return `/uploads/products/${uniqueName}`;
  } catch (err) {
    console.error('Failed to save local file:', err);
    throw new Error(`Local file write failed: ${err.message}`);
  }
};

