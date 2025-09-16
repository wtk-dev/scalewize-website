#!/usr/bin/env node

/**
 * Test script for the email service integration
 * This tests the email service without requiring n8n to be running
 */

// Mock the environment variables for testing
process.env.N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/send-email'
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'

async function testEmailService() {
  console.log('🧪 Testing email service integration...')
  
  try {
    // Import the email service
    const { sendVerificationEmail } = await import('./src/lib/email-service.ts')
    
    console.log('✅ Email service imported successfully')
    
    // Test data
    const testParams = {
      to: 'test@example.com',
      verificationUrl: 'http://localhost:3000/verify-email?token=test-token&email=test@example.com',
      fullName: 'Test User',
      organizationName: 'Test Organization'
    }
    
    console.log('📧 Test parameters:', testParams)
    
    // This will fail if n8n is not running, but we can test the structure
    console.log('📤 Attempting to send verification email...')
    const result = await sendVerificationEmail(testParams)
    
    console.log('📋 Result:', result)
    
    if (result.success) {
      console.log('✅ Email service is working correctly!')
    } else {
      console.log('⚠️  Email service failed (expected if n8n is not running):', result.error)
      console.log('💡 This is normal if n8n is not running - the service will fall back to Supabase')
    }
    
  } catch (error) {
    console.error('❌ Error testing email service:', error.message)
    
    if (error.message.includes('Cannot find module')) {
      console.log('💡 Make sure you are running this from the project root directory')
    }
  }
}

// Run the test
testEmailService()
