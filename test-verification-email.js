#!/usr/bin/env node

/**
 * Test script for verification email via n8n workflow
 * Usage: node test-verification-email.js
 */

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/send-email'

async function testVerificationEmail() {
  console.log('🧪 Testing verification email via n8n workflow...')
  console.log('📧 Webhook URL:', N8N_WEBHOOK_URL)

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

  try {
    console.log('📤 Sending test email...')
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Email sent successfully!')
    console.log('📋 Response:', JSON.stringify(result, null, 2))

  } catch (error) {
    console.error('❌ Error sending email:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Make sure your n8n instance is running and accessible')
      console.log('💡 Check that the N8N_WEBHOOK_URL is correct')
    }
    
    process.exit(1)
  }
}

// Run the test
testVerificationEmail()
