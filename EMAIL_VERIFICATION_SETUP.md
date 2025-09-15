# Email Verification Setup Guide

This guide explains how to set up email verification for the Henly AI dashboard using the n8n workflow system.

## Overview

The email verification system uses n8n workflows to send professional, branded emails to users when they sign up. This provides better deliverability and customization compared to basic Supabase Auth emails.

## Prerequisites

1. **n8n Instance**: You need a running n8n instance (local or cloud)
2. **SMTP Configuration**: Configure SMTP credentials in n8n
3. **Environment Variables**: Set up the required environment variables

## Setup Steps

### 1. Environment Configuration

Add the following to your `.env.local` file:

```bash
# Email Configuration (n8n workflow)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/send-email

# Application URLs
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 2. n8n Workflow Setup

Import the provided n8n workflow JSON into your n8n instance. The workflow includes:

- **Webhook Trigger**: Receives email requests from the application
- **Data Processing**: Processes different email types (verification, invitation, welcome, etc.)
- **Email Sending**: Sends emails via SMTP
- **Response Handling**: Returns success/failure responses

#### Workflow Features

- **Multiple Email Types**: Supports verification, invitation, welcome, password reset, and organization creation emails
- **Professional Templates**: Beautiful HTML email templates with Henly AI branding
- **Error Handling**: Comprehensive error handling and logging
- **SMTP Integration**: Uses your configured SMTP provider

### 3. SMTP Configuration

In your n8n instance, configure the SMTP credentials:

1. Go to **Credentials** in n8n
2. Create a new **SMTP** credential
3. Configure with your email provider settings:
   - **Host**: Your SMTP server (e.g., smtp.gmail.com)
   - **Port**: 587 (TLS) or 465 (SSL)
   - **Username**: Your email address
   - **Password**: Your app password or SMTP password
   - **Secure**: Enable TLS/SSL

### 4. Testing the Setup

Use the provided test script to verify your setup:

```bash
# Set your n8n webhook URL
export N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/send-email

# Run the test
node test-verification-email.js
```

## API Endpoints

### Send Verification Email

**POST** `/api/send-verification-email`

Sends a verification email to a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent successfully",
  "messageId": "n8n-1234567890"
}
```

## Email Templates

The system includes professionally designed email templates for:

### Verification Email
- **Subject**: "Verify your email to join [Organization] on Henly AI"
- **Features**: Clean design, clear call-to-action, security information
- **Branding**: Henly AI colors and logo

### Invitation Email
- **Subject**: "You're invited to join [Organization] on Henly AI"
- **Features**: Organization details, inviter information, expiration warning

### Welcome Email
- **Subject**: "Welcome to [Organization] on Henly AI!"
- **Features**: Feature highlights, dashboard access, getting started guide

## Integration Points

### Signup Process

The verification email is automatically sent during user signup:

1. **Direct Signup** (`/api/signup-direct`): Sends verification email after profile creation
2. **Simple Signup** (`/api/signup-simple`): Sends verification email if email confirmation is required

### Verification Flow

1. User receives verification email with unique link
2. User clicks link, goes to `/verify-email` page
3. Page validates token and updates user verification status
4. User is redirected to login page

## Configuration Options

### Environment-Based Behavior

- **Development**: Verification emails are optional (can be disabled)
- **Production**: Verification emails are required for all new users

### Email Service Fallback

The system includes a fallback mechanism:

1. **Primary**: n8n workflow (recommended)
2. **Fallback**: Supabase Auth emails (if n8n fails)

## Troubleshooting

### Common Issues

1. **Connection Refused**: Check n8n instance is running and accessible
2. **SMTP Errors**: Verify SMTP credentials and server settings
3. **Template Issues**: Check HTML template syntax in n8n workflow
4. **Webhook Errors**: Verify webhook URL and n8n workflow configuration

### Debug Steps

1. Check n8n workflow execution logs
2. Verify environment variables are set correctly
3. Test webhook endpoint directly
4. Check SMTP provider logs

### Logs

The system logs all email sending attempts:

```javascript
console.log('Verification email sent successfully:', messageId)
console.error('Failed to send verification email:', error)
```

## Security Considerations

- **Token Expiration**: Verification links expire in 24 hours
- **HTTPS Required**: All verification links must use HTTPS in production
- **Email Validation**: Email addresses are validated before sending
- **Rate Limiting**: Consider implementing rate limiting for email sending

## Monitoring

Monitor the following metrics:

- **Email Delivery Rate**: Track successful email sends
- **Verification Completion Rate**: Track how many users complete verification
- **Error Rates**: Monitor failed email sends and webhook errors
- **Response Times**: Track n8n workflow execution times

## Support

For issues with email verification:

1. Check n8n workflow logs
2. Verify SMTP configuration
3. Test with the provided test script
4. Contact support with specific error messages

## Future Enhancements

Potential improvements:

- **Email Analytics**: Track open rates and click-through rates
- **A/B Testing**: Test different email templates
- **Localization**: Support multiple languages
- **Advanced Templates**: Dynamic content based on user data
- **Email Scheduling**: Delayed or scheduled email sending
