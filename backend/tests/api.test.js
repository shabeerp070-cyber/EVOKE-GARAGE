import assert from 'assert';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { generateWhatsAppPayload } from '../controllers/bookingController.js';
import { validateBookingData } from '../middleware/validator.js';

console.log('🧪 Starting EVOKE GARAGE Backend Tests...\n');

// 1. Test WhatsApp Payload Generation for Bookings
console.log('Test 1: Booking WhatsApp Payload Generator');
const testBooking = {
  _id: '672456789abcdef012345678',
  fullName: 'Arjun Menon',
  phoneNumber: '+919876543210',
  carBrandModel: 'Porsche 911 GT3',
  selectedService: 'DOWN-DRAFT CERAMIC PAINTWORK',
  problemDescription: 'Custom paint finish and bonnet stone chip repair',
  preferredBookingDate: '2026-11-05',
};

const waPayload = generateWhatsAppPayload(testBooking, '911234567890');
assert.strictEqual(waPayload.number, '911234567890', 'WhatsApp number should match configured number');
assert(waPayload.url.startsWith('https://wa.me/911234567890?text='), 'URL should start with wa.me');
assert(waPayload.message.includes('Arjun Menon'), 'Message should contain customer name');
assert(waPayload.message.includes('Porsche 911 GT3'), 'Message should contain vehicle');
assert(waPayload.message.includes('#EVK-345678'), 'Message should contain booking reference');
assert(waPayload.url.includes(encodeURIComponent('Arjun Menon')), 'URL must be properly URL-encoded');
console.log('✅ Booking WhatsApp Payload Generator passed!\n');

// 2. Test Booking Validator: Missing Fields
console.log('Test 2: Validation Middleware (Missing required fields)');
let validationFailed = false;
let responseStatus = 0;
let responseBody = null;

const fakeReq = {
  body: {
    fullName: '',
    phoneNumber: '123',
    selectedService: '',
  },
};

const fakeRes = {
  status(code) {
    responseStatus = code;
    return this;
  },
  json(data) {
    responseBody = data;
    validationFailed = true;
  },
};

validateBookingData(fakeReq, fakeRes, () => {
  assert.fail('Validator should not call next() for invalid data');
});

assert.strictEqual(responseStatus, 400, 'Status should be 400 Bad Request');
assert.strictEqual(responseBody.success, false, 'Success should be false');
assert(responseBody.errors.length >= 3, 'Should catch multiple validation errors');
console.log('✅ Validation Middleware caught empty fields correctly!\n');

// 3. Test Booking Validator: Valid Fields Normalization
console.log('Test 3: Validation Middleware (Valid data normalization)');
const validReq = {
  body: {
    name: '  Rahul Varma  ',
    phone: '+91 94471 23456',
    service: 'PRECISION DENT EXTRACTION & COACHCRAFT',
    vehicle: 'BMW M3 Competition',
    notes: 'Left rear arch denting',
    date: '2026-11-10',
  },
};

let nextCalled = false;
validateBookingData(validReq, fakeRes, () => {
  nextCalled = true;
});

assert(nextCalled, 'Validator should call next() for valid data');
assert.strictEqual(validReq.validatedBooking.fullName, 'Rahul Varma', 'Name should be trimmed');
assert.strictEqual(validReq.validatedBooking.phoneNumber, '+91 94471 23456', 'Phone should be preserved');
assert.strictEqual(validReq.validatedBooking.selectedService, 'PRECISION DENT EXTRACTION & COACHCRAFT');
assert.strictEqual(validReq.validatedBooking.carBrandModel, 'BMW M3 Competition');
console.log('✅ Validation Middleware correctly normalized aliases and trimmed strings!\n');

// 4. Test Password Hashing & Bcrypt Verification
console.log('Test 4: Admin Password Security (Bcrypt hashing)');
const plainPassword = 'Evoke@Admin2026!';
const salt = bcrypt.genSaltSync(10);
const hashed = bcrypt.hashSync(plainPassword, salt);
assert(bcrypt.compareSync(plainPassword, hashed), 'Correct password must match hash');
assert(!bcrypt.compareSync('WrongPassword123', hashed), 'Wrong password must be rejected');
console.log('✅ Admin Password Hashing & Comparison verified!\n');

// 5. Test JWT Signing & Verification
console.log('Test 5: JWT Token Security');
const secret = 'evoke_test_secret_key_123';
const token = jwt.sign({ id: 'admin123', role: 'admin' }, secret, { expiresIn: '1h' });
const decoded = jwt.verify(token, secret);
assert.strictEqual(decoded.id, 'admin123', 'Decoded token ID must match');
assert.strictEqual(decoded.role, 'admin', 'Decoded token role must match');

let tokenRejected = false;
try {
  jwt.verify(token, 'wrong_secret');
} catch (e) {
  tokenRejected = true;
}
assert(tokenRejected, 'Token must be rejected with invalid secret');
console.log('✅ JWT Token Signing and Verification verified!\n');

console.log('🎉 ALL BACKEND UNIT & SECURITY TESTS PASSED SUCCESSFULLY!');
