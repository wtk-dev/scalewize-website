#!/usr/bin/env node

/**
 * Test script for n8n email webhook
 * This script tests the invitation email webhook endpoint
 */

const https = require('https');
const http = require('http');

// Configuration
const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/send-email';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

// Test data for invitation email
const testInvitationData = {
  type: 'invitation',
  to: TEST_EMAIL,
  metadata: {
    organizationName: 'Test Organization',
    inviterName: 'Test Admin',
    inviteUrl: 'http://localhost:3000/invite/test-token-123',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
  }
};

// Test data for other email types (if you want to test them)
const testWelcomeData = {
  type: 'welcome',
  to: TEST_EMAIL,
  metadata: {
    userName: 'Test User',
    organizationName: 'Test Organization',
    dashboardUrl: 'http://localhost:3000/dashboard'
  }
};

const testPasswordResetData = {
  type: 'password_reset',
  to: TEST_EMAIL,
  metadata: {
    userName: 'Test User',
    resetUrl: 'http://localhost:3000/reset-password?token=test-reset-token',
    expiresAt: '24 hours'
  }
};

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testWebhook(testName, testData) {
  console.log(`\n🧪 Testing: ${testName}`);
  console.log(`📧 Sending to: ${testData.to}`);
  console.log(`🔗 Webhook URL: ${WEBHOOK_URL}`);
  console.log(`📦 Data:`, JSON.stringify(testData, null, 2));
  
  try {
    const response = await makeRequest(WEBHOOK_URL, testData);
    
    console.log(`✅ Response Status: ${response.statusCode}`);
    console.log(`📋 Response Headers:`, response.headers);
    console.log(`📄 Response Body:`, response.data);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`🎉 ${testName} - SUCCESS!`);
    } else {
      console.log(`❌ ${testName} - FAILED (Status: ${response.statusCode})`);
    }
    
  } catch (error) {
    console.log(`💥 ${testName} - ERROR:`, error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting n8n Webhook Tests');
  console.log('================================');
  
  // Test invitation email
  await testWebhook('Invitation Email', testInvitationData);
  
  // Uncomment these if you want to test other email types
  // await testWebhook('Welcome Email', testWelcomeData);
  // await testWebhook('Password Reset Email', testPasswordResetData);
  
  console.log('\n✨ Tests completed!');
  console.log('\n📝 Notes:');
  console.log('- Check your n8n workflow logs for processing details');
  console.log('- Verify the email was sent to your test email address');
  console.log('- Make sure your n8n workflow is running and accessible');
}

// Run the tests
runTests().catch(console.error);
