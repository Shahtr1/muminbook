/**
 * @fileoverview Vitest Setup File
 *
 * This file runs before all tests and sets up necessary environment variables.
 * It's particularly important for modules that read environment variables at import time.
 */

// Set up environment variables for all tests
process.env.NODE_ENV = 'test';
process.env.PORT = '4004';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';
process.env.APP_ORIGIN = 'http://localhost:3000';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing';
process.env.EMAIL_SENDER = 'test@example.com';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.ADMIN_FIRSTNAME = 'Test';
process.env.ADMIN_LASTNAME = 'Admin';
process.env.ADMIN_DATE_OF_BIRTH = '1990-01-01';
process.env.ADMIN_GENDER = 'male';
process.env.ADMIN_EMAIL = 'admin@test.com';
process.env.ADMIN_PASSWORD = 'testPassword123';
