# n8n Workflow Setup Guide - Email Verification System

This guide will walk you through setting up the n8n workflow for the Henly AI email verification system.

## Prerequisites

- n8n instance (local or cloud)
- SMTP email provider (Gmail, SendGrid, etc.)
- Access to your n8n admin panel

## Step-by-Step Setup Process

### Step 1: Access Your n8n Instance

1. **Open your n8n instance** in your browser
2. **Log in** with your admin credentials
3. **Navigate to the workflows section**

### Step 2: Create a New Workflow

1. **Click "New Workflow"** or the "+" button
2. **Name your workflow**: "Henly AI Email System" or "Dashboard Email Sending - Active"
3. **Save the workflow** (Ctrl+S or Cmd+S)

### Step 3: Add the Webhook Trigger

1. **Click the "+" button** to add a node
2. **Search for "Webhook"** and select it
3. **Configure the webhook**:
   - **HTTP Method**: POST
   - **Path**: `/send-email`
   - **Response Mode**: "Respond to Webhook"
   - **Options**: Leave default settings
4. **Click "Execute Node"** to get your webhook URL
5. **Copy the webhook URL** - you'll need this for your environment variables

### Step 4: Add the Data Processing Node

1. **Add another node** by clicking the "+" button
2. **Search for "Code"** and select it
3. **Name it**: "Process Email Data"
4. **Paste the following code**:

```javascript
// Extract data from webhook
const rawInput = $input.first();
let webhookData;

if (rawInput.json && rawInput.json.body) {
  webhookData = rawInput.json.body;
} else if (rawInput.body) {
  webhookData = rawInput.body;
} else if (rawInput.json) {
  webhookData = rawInput.json;
} else {
  webhookData = rawInput;
}

console.log('Webhook data received:', webhookData);

// Validate required fields
if (!webhookData.type || !webhookData.to) {
  throw new Error('Missing required fields: type and to');
}

// Process email based on type
let processedEmail;

switch (webhookData.type) {
  case 'invitation':
    processedEmail = {
      to: webhookData.to,
      from: 'seb@henly.ai',
      subject: `You're invited to join ${webhookData.metadata?.organizationName || 'our organization'} on Henly AI`,
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
            <p style="font-size: 18px; color: #666;">Join ${webhookData.metadata?.organizationName || 'our organization'} on Henly AI</p>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
            <p style="margin-bottom: 15px;">
              <strong>${webhookData.metadata?.inviterName || 'A team member'}</strong> has invited you to join 
              <strong>${webhookData.metadata?.organizationName || 'our organization'}</strong> on Henly AI.
            </p>
            
            <p style="margin-bottom: 20px;">
              Henly AI is a powerful platform for AI-powered chatbots and automation tools.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${webhookData.metadata?.inviteUrl || '#'}" 
                 style="background: #595F39; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; text-align: center;">
              This invitation expires on ${webhookData.metadata?.expiresAt || 'December 31, 2024'}
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

${webhookData.metadata?.inviterName || 'A team member'} has invited you to join ${webhookData.metadata?.organizationName || 'our organization'} on Henly AI.

Henly AI is a powerful platform for AI-powered chatbots and automation tools.

Accept your invitation: ${webhookData.metadata?.inviteUrl || '#'}

This invitation expires on ${webhookData.metadata?.expiresAt || 'December 31, 2024'}.

Questions? Contact us at seb@henly.ai
      `
    };
    break;
    
  case 'verification':
    processedEmail = {
      to: webhookData.to,
      from: 'seb@henly.ai',
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
              <a href="${webhookData.metadata?.verificationUrl || '#'}" 
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

Verify your email: ${webhookData.metadata?.verificationUrl || '#'}

This verification link expires in 24 hours.

Questions? Contact us at seb@henly.ai
      `
    };
    break;
    
  case 'welcome':
    processedEmail = {
      to: webhookData.to,
      from: 'seb@henly.ai',
      subject: `Welcome to ${webhookData.metadata?.organizationName || 'Henly AI'}! 🎉`,
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
              Hi <strong>${webhookData.metadata?.userName || 'there'}</strong>! Welcome to 
              <strong>${webhookData.metadata?.organizationName || 'Henly AI'}</strong>.
            </p>
            
            <p style="margin-bottom: 20px;">
              Your account has been successfully created and you're ready to start using our AI-powered platform.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${webhookData.metadata?.dashboardUrl || 'https://henly.ai/dashboard'}" 
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

Hi ${webhookData.metadata?.userName || 'there'}! Welcome to ${webhookData.metadata?.organizationName || 'Henly AI'}.

Your account has been successfully created and you're ready to start using our AI-powered platform.

Go to Dashboard: ${webhookData.metadata?.dashboardUrl || 'https://henly.ai/dashboard'}

Questions? Contact us at seb@henly.ai
      `
    };
    break;
    
  case 'password_reset':
    processedEmail = {
      to: webhookData.to,
      from: 'seb@henly.ai',
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
              <a href="${webhookData.metadata?.resetUrl || '#'}" 
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

Reset your password: ${webhookData.metadata?.resetUrl || '#'}

This reset link expires in 1 hour.

Questions? Contact us at seb@henly.ai
      `
    };
    break;
    
  case 'organization_created':
    processedEmail = {
      to: webhookData.to,
      from: 'seb@henly.ai',
      subject: `Welcome to ${webhookData.metadata?.organizationName || 'Henly AI'}! 🚀`,
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
              Congratulations! Your organization <strong>${webhookData.metadata?.organizationName || 'Organization'}</strong> has been successfully created on Henly AI.
            </p>
            
            <p style="margin-bottom: 20px;">
              As the admin, you can now invite team members and start building your AI-powered solutions.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${webhookData.metadata?.dashboardUrl || 'https://henly.ai/dashboard'}" 
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

Congratulations! Your organization ${webhookData.metadata?.organizationName || 'Organization'} has been successfully created on Henly AI.

As the admin, you can now invite team members and start building your AI-powered solutions.

Go to Dashboard: ${webhookData.metadata?.dashboardUrl || 'https://henly.ai/dashboard'}

Questions? Contact us at seb@henly.ai
      `
    };
    break;
    
  default:
    throw new Error(`Unsupported email type: ${webhookData.type}`);
}

console.log('Processed email:', processedEmail);
return processedEmail;
```

5. **Click "Execute Node"** to test the code
6. **Connect the webhook to this node** by dragging from the webhook output to this node's input

### Step 5: Add the Email Sending Node

1. **Add another node** by clicking the "+" button
2. **Search for "Email Send"** and select it
3. **Configure the email node**:
   - **From Email**: `seb@henly.ai` (or your preferred sender email)
   - **To Email**: `={{ $json.to }}`
   - **Subject**: `={{ $json.subject }}`
   - **HTML**: `={{ $json.html }}`
   - **Text**: `={{ $json.text }}`
   - **Append Attribution**: Uncheck this option
4. **Set up SMTP credentials**:
   - Click on the credentials dropdown
   - Create new SMTP credentials
   - Enter your email provider details

### Step 6: Add Success Logging Node

1. **Add another node** by clicking the "+" button
2. **Search for "Code"** and select it
3. **Name it**: "Success Log"
4. **Paste the following code**:

```javascript
// Simple success logging
const successData = {
  status: 'success',
  timestamp: new Date().toISOString(),
  message: 'Email sent successfully',
  emailType: $input.first().type,
  recipient: $input.first().to,
  subject: $input.first().subject
};

console.log('✅ Email workflow success:', successData);
return successData;
```

### Step 7: Add Response Node

1. **Add another node** by clicking the "+" button
2. **Search for "Respond to Webhook"** and select it
3. **Configure the response**:
   - **Respond With**: JSON
   - **Response Body**: `={{ $json }}`

### Step 8: Connect All Nodes

Connect the nodes in this order:
1. **Webhook** → **Process Email Data**
2. **Process Email Data** → **Email Send**
3. **Email Send** → **Success Log**
4. **Success Log** → **Respond to Webhook**

### Step 9: Configure SMTP Credentials

1. **Click on the Email Send node**
2. **Click on the credentials dropdown**
3. **Create new SMTP credentials**:
   - **Name**: "Henly AI SMTP"
   - **Host**: Your SMTP server (e.g., `smtp.gmail.com`)
   - **Port**: 587 (for TLS) or 465 (for SSL)
   - **Username**: Your email address
   - **Password**: Your app password or SMTP password
   - **Secure**: Enable TLS/SSL
4. **Test the connection** to ensure it works

### Step 10: Activate the Workflow

1. **Click the "Active" toggle** in the top right corner
2. **Confirm activation** when prompted
3. **Copy the webhook URL** from the webhook node

### Step 11: Update Environment Variables

1. **Open your `.env.local` file**
2. **Add the webhook URL**:
   ```bash
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/send-email
   ```

### Step 12: Test the Workflow

1. **Run the test script**:
   ```bash
   node test-verification-email.js
   ```
2. **Check the n8n execution logs** to see if the email was sent
3. **Verify the email was received** in your inbox

## Troubleshooting

### Common Issues

1. **Webhook not receiving data**:
   - Check the webhook URL is correct
   - Verify the workflow is active
   - Check n8n logs for errors

2. **SMTP connection failed**:
   - Verify SMTP credentials are correct
   - Check if your email provider requires app passwords
   - Ensure firewall allows SMTP connections

3. **Email not being sent**:
   - Check the email node configuration
   - Verify the data flow between nodes
   - Check n8n execution logs

### Testing Steps

1. **Test webhook format**:
   ```bash
   node test-webhook-format.js
   ```

2. **Test with n8n**:
   ```bash
   node test-verification-email.js
   ```

3. **Test from application**:
   - Sign up a new user
   - Check if verification email is sent
   - Verify email content and links

## Workflow Diagram

```
Webhook → Process Data → Send Email → Success Log → Respond
```

## Support

If you encounter issues:

1. Check the n8n execution logs
2. Verify all node connections
3. Test each node individually
4. Check SMTP credentials
5. Verify webhook URL is accessible

The workflow is now ready to handle all email types for your Henly AI application!
