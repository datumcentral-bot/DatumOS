/**
 * Authentication Seeding Script
 * Initializes authentication system and default users
 */

import crypto from 'crypto';

function generateSecretKey() {
  return crypto.randomBytes(32).toString('hex');
}

function generateUserToken() {
  return crypto.randomBytes(16).toString('hex');
}

async function seedAuth() {
  try {
    console.log('🔐 Seeding authentication system...');

    // Generate keys
    const authSecret = generateSecretKey();
    const adminToken = generateUserToken();
    const serviceToken = generateUserToken();

    console.log('✓ Generated AUTH_SECRET');
    console.log('✓ Generated ADMIN_TOKEN');
    console.log('✓ Generated SERVICE_TOKEN');

    console.log('\n📝 Add these to your .env file:');
    console.log(`AUTH_SECRET=${authSecret}`);
    console.log(`ADMIN_TOKEN=${adminToken}`);
    console.log(`SERVICE_TOKEN=${serviceToken}`);

    console.log('\n✓ Authentication seeding completed');
  } catch (error) {
    console.error('✗ Authentication seeding failed:', error.message);
    process.exit(1);
  }
}

seedAuth();
