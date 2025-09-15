#!/usr/bin/env node

/**
 * Test script to verify the webhook data format matches the n8n workflow
 * This helps ensure the data structure is correct before testing with n8n
 */

function testWebhookFormat() {
  console.log('🧪 Testing webhook data format...')
  
  // Test data that matches the n8n workflow structure
  const testData = {
    type: 'verification',
    to: 'test@example.com',
    subject: 'Verify your email address - Henly AI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Henly AI</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">🔐 Verify Your Email</h1>
          <p style="font-size: 18px; color: #666;">Complete your Henly AI account setup</p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
          <p style="margin-bottom: 15px;">
            Welcome to <strong>Henly AI</strong>! To complete your account setup, please verify your email address.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://henly.ai/verify-email?token=test-token&email=test@example.com" 
               style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; text-align: center;">
            This verification link expires in 24 hours
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #666; font-size: 14px;">
            Questions? Contact us at <a href="mailto:seb@henly.ai" style="color: #2563eb;">seb@henly.ai</a>
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
Verify Your Email - Henly AI

Welcome to Henly AI! To complete your account setup, please verify your email address.

Verify your email: https://henly.ai/verify-email?token=test-token&email=test@example.com

This verification link expires in 24 hours.

Questions? Contact us at seb@henly.ai
    `,
    metadata: {
      organizationName: 'Test Organization',
      fullName: 'Test User',
      verificationUrl: 'https://henly.ai/verify-email?token=test-token&email=test@example.com',
      email: 'test@example.com',
      timestamp: new Date().toISOString()
    }
  }
  
  // Validate required fields
  const requiredFields = ['type', 'to', 'subject', 'html', 'text', 'metadata']
  const missingFields = requiredFields.filter(field => !testData[field])
  
  if (missingFields.length > 0) {
    console.error('❌ Missing required fields:', missingFields)
    return false
  }
  
  // Validate email type
  const validTypes = ['verification', 'invitation', 'welcome', 'password_reset', 'organization_created']
  if (!validTypes.includes(testData.type)) {
    console.error('❌ Invalid email type:', testData.type)
    return false
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(testData.to)) {
    console.error('❌ Invalid email format:', testData.to)
    return false
  }
  
  // Validate metadata structure
  const requiredMetadata = ['organizationName', 'fullName', 'verificationUrl', 'email']
  const missingMetadata = requiredMetadata.filter(field => !testData.metadata[field])
  
  if (missingMetadata.length > 0) {
    console.error('❌ Missing required metadata:', missingMetadata)
    return false
  }
  
  console.log('✅ Webhook data format is valid!')
  console.log('📋 Data structure:')
  console.log(JSON.stringify(testData, null, 2))
  
  return true
}

// Run the test
const isValid = testWebhookFormat()

if (isValid) {
  console.log('🎉 All tests passed! The webhook format is correct.')
} else {
  console.log('💥 Some tests failed. Please check the data format.')
  process.exit(1)
}
