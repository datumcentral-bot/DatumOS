/**
 * Key Generation Script
 * Generates cryptographic keys for the application
 */

import crypto from 'crypto';

function generateKeys() {
  const keys = {
    authSecret: crypto.randomBytes(32).toString('hex'),
    jwtSecret: crypto.randomBytes(32).toString('hex'),
    encryptionKey: crypto.randomBytes(32).toString('hex'),
    apiKey: crypto.randomBytes(16).toString('hex'),
  };

  return keys;
}

async function main() {
  try {
    console.log('🔑 Generating cryptographic keys...');

    const keys = generateKeys();

    console.log('\n📝 Generated Keys (store in .env.local):');
    console.log('---');
    Object.entries(keys).forEach(([key, value]) => {
      console.log(`${key.toUpperCase()}=${value}`);
    });
    console.log('---');

    console.log('\n✓ Key generation completed');
  } catch (error) {
    console.error('✗ Key generation failed:', error.message);
    process.exit(1);
  }
}

main();
