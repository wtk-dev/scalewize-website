#!/usr/bin/env node

/**
 * Test script for sending a single email type
 * Usage: node test-single-email.js [email-type] [email-address]
 * 
 * Email types: verification, invitation, welcome, password_reset, organization_created
 * Example: node test-single-email.js verification sebbydkeating@gmail.com
 */

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/send-email'

// Get command line arguments
const emailType = process.argv[2] || 'verification'
const targetEmail = process.argv[3] || 'sebbydkeating@gmail.com'

// Email templates
const emailTemplates = {
  verification: {
    type: 'verification',
    to: targetEmail,
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
          <h1 style="color: #595F39; margin-bottom: 10px;">🔐 Verify Your Email</h1>
          <p style="font-size: 18px; color: #666;">Complete your Henly AI account setup</p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
          <p style="margin-bottom: 15px;">
            Welcome to <strong>Henly AI</strong>! To complete your account setup, please verify your email address.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://henly.ai/verify-email?token=test-token&email=${targetEmail}" 
               style="background: #595F39; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; text-align: center;">
            This verification link expires in 24 hours
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #666; font-size: 14px;">
            Questions? Contact us at <a href="mailto:seb@henly.ai" style="color: #595F39;">seb@henly.ai</a>
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
Verify Your Email - Henly AI

Welcome to Henly AI! To complete your account setup, please verify your email address.

Verify your email: https://henly.ai/verify-email?token=test-token&email=${targetEmail}

This verification link expires in 24 hours.

Questions? Contact us at seb@henly.ai
    `,
    metadata: {
      organizationName: 'Test Organization',
      fullName: 'Seb Keating',
      verificationUrl: `https://henly.ai/verify-email?token=test-token&email=${targetEmail}`,
      email: targetEmail,
      timestamp: new Date().toISOString()
    }
  },
  
  invitation: {
    type: 'invitation',
    to: targetEmail,
    subject: 'You\'re invited to join Test Organization on Henly AI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to Henly AI</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #595F39; margin-bottom: 10px;">🎉 You're Invited!</h1>
          <p style="font-size: 18px; color: #666;">Join Test Organization on Henly AI</p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
          <p style="margin-bottom: 15px;">
            <strong>John Doe</strong> has invited you to join 
            <strong>Test Organization</strong> on Henly AI.
          </p>
          
          <p style="margin-bottom: 20px;">
            Henly AI is a powerful platform for AI-powered chatbots and automation tools.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://henly.ai/invite/test-token" 
               style="background: #595F39; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; text-align: center;">
            This invitation expires on December 31, 2024
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #666; font-size: 14px;">
            Questions? Contact us at <a href="mailto:seb@henly.ai" style="color: #595F39;">seb@henly.ai</a>
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
You're Invited to Henly AI!

John Doe has invited you to join Test Organization on Henly AI.

Henly AI is a powerful platform for AI-powered chatbots and automation tools.

Accept your invitation: https://henly.ai/invite/test-token

This invitation expires on December 31, 2024.

Questions? Contact us at seb@henly.ai
    `,
    metadata: {
      organizationName: 'Test Organization',
      inviterName: 'John Doe',
      inviteUrl: 'https://henly.ai/invite/test-token',
      expiresAt: 'December 31, 2024',
      timestamp: new Date().toISOString()
    }
  },
  
  welcome: {
    type: 'welcome',
    to: targetEmail,
    subject: 'Welcome to Test Organization on Henly AI! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Henly AI</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #595F39; margin-bottom: 10px;">🎉 Welcome to Henly AI!</h1>
          <p style="font-size: 18px; color: #666;">Your account is ready to go</p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
          <p style="margin-bottom: 15px;">
            Hi <strong>Seb Keating</strong>! Welcome to 
            <strong>Test Organization</strong>.
          </p>
          
          <p style="margin-bottom: 20px;">
            Your account has been successfully created and you're ready to start using our AI-powered platform.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://henly.ai/dashboard" 
               style="background: #595F39; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #666; font-size: 14px;">
            Questions? Contact us at <a href="mailto:seb@henly.ai" style="color: #595F39;">seb@henly.ai</a>
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to Henly AI!

Hi Seb Keating! Welcome to Test Organization.

Your account has been successfully created and you're ready to start using our AI-powered platform.

Go to Dashboard: https://henly.ai/dashboard

Questions? Contact us at seb@henly.ai
    `,
    metadata: {
      organizationName: 'Test Organization',
      userName: 'Seb Keating',
      dashboardUrl: 'https://henly.ai/dashboard',
      timestamp: new Date().toISOString()
    }
  },
  
  password_reset: {
    type: 'password_reset',
    to: targetEmail,
    subject: 'Reset your password - Henly AI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password - Henly AI</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; margin-bottom: 10px;">🔑 Reset Your Password</h1>
          <p style="font-size: 18px; color: #666;">Secure your Henly AI account</p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
          <p style="margin-bottom: 15px;">
            We received a request to reset your password for your <strong>Henly AI</strong> account.
          </p>
          
          <p style="margin-bottom: 20px;">
            If you didn't request this, you can safely ignore this email.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://henly.ai/reset-password?token=test-token" 
               style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; text-align: center;">
            This reset link expires in 1 hour
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #666; font-size: 14px;">
            Questions? Contact us at <a href="mailto:seb@henly.ai" style="color: #595F39;">seb@henly.ai</a>
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
Reset Your Password - Henly AI

We received a request to reset your password for your Henly AI account.

If you didn't request this, you can safely ignore this email.

Reset your password: https://henly.ai/reset-password?token=test-token

This reset link expires in 1 hour.

Questions? Contact us at seb@henly.ai
    `,
    metadata: {
      resetUrl: 'https://henly.ai/reset-password?token=test-token',
      timestamp: new Date().toISOString()
    }
  },
  
  organization_created: {
    type: 'organization_created',
    to: targetEmail,
    subject: 'Welcome to Test Organization on Henly AI! 🚀',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Organization Created - Henly AI</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #595F39; margin-bottom: 10px;">🚀 Organization Created!</h1>
          <p style="font-size: 18px; color: #666;">Welcome to Henly AI</p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
          <p style="margin-bottom: 15px;">
            Congratulations! Your organization <strong>Test Organization</strong> has been successfully created on Henly AI.
          </p>
          
          <p style="margin-bottom: 20px;">
            As the admin, you can now invite team members and start building your AI-powered solutions.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://henly.ai/dashboard" 
               style="background: #595F39; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #666; font-size: 14px;">
            Questions? Contact us at <a href="mailto:seb@henly.ai" style="color: #595F39;">seb@henly.ai</a>
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
Organization Created - Henly AI

Congratulations! Your organization Test Organization has been successfully created on Henly AI.

As the admin, you can now invite team members and start building your AI-powered solutions.

Go to Dashboard: https://henly.ai/dashboard

Questions? Contact us at seb@henly.ai
    `,
    metadata: {
      organizationName: 'Test Organization',
      dashboardUrl: 'https://henly.ai/dashboard',
      timestamp: new Date().toISOString()
    }
  }
}

async function sendTestEmail() {
  const template = emailTemplates[emailType]
  
  if (!template) {
    console.error(`❌ Unknown email type: ${emailType}`)
    console.log('Available types:', Object.keys(emailTemplates).join(', '))
    process.exit(1)
  }
  
  console.log(`🧪 Testing ${emailType} email`)
  console.log(`📧 Sending to: ${targetEmail}`)
  console.log(`🔗 Webhook URL: ${N8N_WEBHOOK_URL}`)
  console.log(`📋 Subject: ${template.subject}`)
  
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Email sent successfully!')
    console.log('📋 Response:', JSON.stringify(result, null, 2))
    console.log('📧 Check your email inbox!')

  } catch (error) {
    console.error('❌ Error sending email:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Make sure your n8n instance is running and accessible')
      console.log('💡 Check that the N8N_WEBHOOK_URL is correct')
    }
    
    process.exit(1)
  }
}

// Show usage if no arguments provided
if (process.argv.length < 3) {
  console.log('Usage: node test-single-email.js [email-type] [email-address]')
  console.log('')
  console.log('Email types:')
  Object.keys(emailTemplates).forEach(type => {
    console.log(`  - ${type}`)
  })
  console.log('')
  console.log('Examples:')
  console.log('  node test-single-email.js verification sebbydkeating@gmail.com')
  console.log('  node test-single-email.js invitation sebbydkeating@gmail.com')
  console.log('  node test-single-email.js welcome sebbydkeating@gmail.com')
  console.log('  node test-single-email.js password_reset sebbydkeating@gmail.com')
  console.log('  node test-single-email.js organization_created sebbydkeating@gmail.com')
  process.exit(0)
}

// Run the test
sendTestEmail()
