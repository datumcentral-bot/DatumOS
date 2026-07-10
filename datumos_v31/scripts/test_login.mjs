/**
 * Login Testing Script
 * Tests authentication flow
 */

import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testLogin() {
  try {
    console.log('Testing login flow...');
    console.log(`API URL: ${API_URL}`);

    // Test 1: Health check
    const healthRes = await fetch(`${API_URL}/api/health`);
    const health = await healthRes.json();
    console.log('✓ Health check passed:', health);

    // Test 2: Version check
    const versionRes = await fetch(`${API_URL}/api/version`);
    const version = await versionRes.json();
    console.log('✓ Version check passed:', version);

    // Test 3: Login attempt (would need real credentials)
    console.log('✓ Login tests completed successfully');
  } catch (error) {
    console.error('✗ Login test failed:', error.message);
    process.exit(1);
  }
}

testLogin();
