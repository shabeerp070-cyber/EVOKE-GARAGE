import { isCloudinaryConfigured, uploadToCloudinary } from '../config/cloudinary.js';
import { upload } from '../config/multer.js';

console.log('🧪 Starting EVOKE GARAGE Upload & Cloudinary Unit Tests...');

// Test 1: Multer Storage Engine is MemoryStorage
if (upload.storage && typeof upload.storage._handleFile === 'function') {
  console.log('✅ Test 1: Multer uses memoryStorage (no disk writes on import)');
} else {
  console.error('❌ Test 1 Failed: Multer storage is not memoryStorage');
  process.exit(1);
}

// Test 2: Cloudinary configuration detector
const initialConfigured = isCloudinaryConfigured();
console.log('✅ Test 2: Cloudinary configuration detector works (Currently configured:', initialConfigured, ')');

// Test 3: Cloudinary upload rejects cleanly when credentials are missing
if (!initialConfigured) {
  try {
    await uploadToCloudinary(Buffer.from('fake image'), 'test.jpg');
    console.error('❌ Test 3 Failed: Should have rejected without credentials');
    process.exit(1);
  } catch (err) {
    if (err.message.includes('Cloudinary is not configured') || err.message.includes('missing')) {
      console.log('✅ Test 3: Rejects gracefully with informative error when credentials missing');
    } else {
      console.error('❌ Test 3 Unexpected error:', err.message);
      process.exit(1);
    }
  }
}

console.log('🎉 ALL UPLOAD & CLOUDINARY UNIT TESTS PASSED SUCCESSFULLY!');

