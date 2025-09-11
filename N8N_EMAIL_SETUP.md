# 🚀 n8n Email Workflow Setup Guide

## Overview
This guide shows you how to set up n8n workflows to handle email sending for Henly AI via webhooks. This approach gives you complete control over the email process, allows you to use any email service, and provides advanced automation capabilities.

## 🎯 Benefits of n8n + Webhook Approach

- **Complete Control**: Choose any email service (Gmail, Outlook, custom SMTP)
- **Flexible Logic**: Add conditions, delays, retries, error handling
- **Multiple Triggers**: Webhook, scheduled, manual, database changes
- **Cost Effective**: Use your existing email accounts
- **Professional Domain**: Can still use `admin@scalewize.ai`
- **Advanced Features**: Email tracking, analytics, A/B testing, retry logic
- **Integration**: Connect with other services (CRM, analytics, etc.)

## 🔧 Setup Steps

### Step 1: Install n8n

#### Option A: Docker (Recommended)
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

#### Option B: npm
```bash
npm install n8n -g
n8n start
```

#### Option C: Cloud Hosting
- [n8n.cloud](https://n8n.cloud) (official)
- [Railway](https://railway.app)
- [Render](https://render.com)

### Step 2: Create Email Workflow

#### Workflow Structure
```
Webhook Trigger → Process Data → Send Email → Log Results → Error Handling
```

#### Detailed Workflow

1. **Webhook Trigger Node**
   - **Node Type**: Webhook
   - **HTTP Method**: POST
   - **Path**: `/send-email`
   - **Response Mode**: Respond to Webhook
   - **Copy the webhook URL** (you'll need this for your environment variable)

2. **Process Data Node (Code)**
   - **Node Type**: Code
   - **Language**: JavaScript
   - **Code**:
   ```javascript
   // Extract data from webhook
   const { type, to, subject, html, text, metadata } = $input.first().json;
   
   // Validate required fields
   if (!to || !subject || !html) {
     throw new Error('Missing required fields: to, subject, html');
   }
   
   // Set email configuration based on type
   let fromEmail, fromName, replyTo;
   
   switch(type) {
     case 'invitation':
       fromEmail = 'admin@scalewize.ai';
       fromName = 'Henly AI';
       replyTo = 'support@scalewize.ai';
       break;
     case 'welcome':
       fromEmail = 'admin@scalewize.ai';
       fromName = 'Henly AI';
       replyTo = 'support@scalewize.ai';
       break;
     default:
       fromEmail = 'noreply@scalewize.ai';
       fromName = 'Henly AI';
       replyTo = 'support@scalewize.ai';
   }
   
   // Return processed data
   return {
     to,
     from: `${fromName} <${fromEmail}>`,
     replyTo,
     subject,
     html,
     text,
     metadata,
     type
   };
   ```

3. **Send Email Node (Gmail)**
   - **Node Type**: Gmail
   - **Operation**: Send Email
   - **To**: `{{ $json.to }}`
   - **From**: `{{ $json.from }}`
   - **Reply To**: `{{ $json.replyTo }}`
   - **Subject**: `{{ $json.subject }}`
   - **HTML Content**: `{{ $json.html }}`
   - **Text Content**: `{{ $json.text }}`

4. **Success Log Node (Code)**
   - **Node Type**: Code
   - **Language**: JavaScript
   - **Code**:
   ```javascript
   // Log successful email
   console.log('Email sent successfully:', {
     to: $json.to,
     subject: $json.subject,
     type: $json.type,
     timestamp: new Date().toISOString(),
     messageId: $('Send Email').first().json.messageId
   });
   
   // Return success response
   return {
     success: true,
     messageId: $('Send Email').first().json.messageId,
     timestamp: new Date().toISOString()
   };
   ```

5. **Error Handler Node (Code)**
   - **Node Type**: Code
   - **Language**: JavaScript
   - **Code**:
   ```javascript
   // Log error details
   console.error('Email sending failed:', {
     error: $json.error,
     to: $json.to,
     subject: $json.subject,
     type: $json.type,
     timestamp: new Date().toISOString()
   });
   
   // Return error response
   return {
     success: false,
     error: $json.error,
     timestamp: new Date().toISOString()
   };
   ```

### Step 3: Configure Email Service

#### Option A: Gmail (Recommended for Starters)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use the app password** in n8n Gmail node

#### Option B: Custom SMTP
1. **Add SMTP Node** instead of Gmail node
2. **Configure with your SMTP settings**:
   - Host: `smtp.gmail.com` (or your provider)
   - Port: `587`
   - Username: `your-email@gmail.com`
   - Password: `your-app-password`
   - Security: `STARTTLS`

#### Option C: Multiple Email Services
Create multiple email nodes and use a **Switch** node to route based on email type or recipient domain.

### Step 4: Add Environment Variable

Add this to your `.env.local` file:
```bash
# n8n webhook URL for email sending
N8N_WEBHOOK_URL=http://localhost:5678/webhook/send-email
```

**For production**, use your actual n8n URL:
```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/send-email
```

## 🎨 Advanced Workflow Features

### Retry Logic
Add a **Retry** node after the email node to automatically retry failed emails:
- **Max Attempts**: 3
- **Wait Time**: 5 minutes
- **Backoff**: Exponential

### Email Tracking
Add a **Database** node to log all email activities:
```javascript
// Log to your database
const emailLog = {
  to: $json.to,
  subject: $json.subject,
  type: $json.type,
  status: 'sent',
  messageId: $('Send Email').first().json.messageId,
  timestamp: new Date().toISOString(),
  metadata: $json.metadata
};

// Insert into your database
return emailLog;
```

### Conditional Logic
Add a **Switch** node to handle different email types:
- **Invitation emails**: Send immediately
- **Welcome emails**: Send with 5-minute delay
- **Marketing emails**: Send during business hours only

### Rate Limiting
Add a **Wait** node to prevent email flooding:
- **Wait Time**: 1 second between emails
- **Use**: When sending to multiple recipients

## 🔍 Testing Your Workflow

### Test the Webhook
```bash
curl -X POST http://localhost:5678/webhook/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invitation",
    "to": "test@example.com",
    "subject": "Test Invitation",
    "html": "<h1>Test Email</h1>",
    "text": "Test Email",
    "metadata": {
      "organizationName": "Test Org",
      "inviterName": "Test User"
    }
  }'
```

### Check n8n Execution Logs
1. **Go to n8n dashboard**
2. **Click on your workflow**
3. **View execution history**
4. **Check for errors or success**

## 🚨 Troubleshooting

### Common Issues

**Webhook not receiving data:**
- ✅ Check webhook URL in environment variable
- ✅ Verify n8n is running and accessible
- ✅ Check firewall/network settings

**Emails not sending:**
- ✅ Verify Gmail/SMTP credentials
- ✅ Check 2FA and app passwords
- ✅ Verify sender email permissions

**Workflow execution errors:**
- ✅ Check n8n execution logs
- ✅ Verify node configurations
- ✅ Test individual nodes

### Debug Mode
Enable debug mode in n8n to see detailed execution information:
```bash
n8n start --debug
```

## 📊 Monitoring & Analytics

### Email Metrics
Track email performance in n8n:
- **Success rate**
- **Delivery time**
- **Error types**
- **Recipient engagement**

### Integration with Henly
Connect email metrics to your main application:
- **Email status updates** in user profiles
- **Invitation tracking** in admin dashboard
- **Analytics dashboard** for email performance

## 🎯 Production Deployment

### Security Considerations
1. **Use HTTPS** for webhook URLs
2. **Add authentication** to webhook endpoints
3. **Rate limit** webhook requests
4. **Validate** incoming data

### Scaling
1. **Use n8n.cloud** for production workloads
2. **Implement queue system** for high-volume emails
3. **Add monitoring** and alerting
4. **Backup workflows** regularly

## 💡 Pro Tips

1. **Start Simple**: Begin with basic Gmail integration
2. **Test Thoroughly**: Use test email addresses
3. **Monitor Logs**: Check n8n execution history regularly
4. **Backup Workflows**: Export workflows as JSON
5. **Version Control**: Track workflow changes
6. **Documentation**: Keep workflow documentation updated

## 🚀 Next Steps

1. **Set up n8n** (local or cloud)
2. **Create the email workflow** following this guide
3. **Test with your Henly application**
4. **Add advanced features** as needed
5. **Deploy to production**

This n8n solution gives you a **professional, scalable, and flexible** email system that integrates perfectly with Henly AI! 🎉
