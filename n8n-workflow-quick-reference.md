# n8n Workflow Quick Reference

## Workflow Overview
- **Name**: Henly AI Email System
- **Trigger**: Webhook (POST /send-email)
- **Nodes**: 5 total
- **Email Types**: 5 supported

## Node Configuration

### 1. Webhook Node
```
Type: Webhook
HTTP Method: POST
Path: /send-email
Response Mode: Respond to Webhook
```

### 2. Process Data Node
```
Type: Code
Name: Process Email Data
Language: JavaScript
```

### 3. Email Send Node
```
Type: Email Send
From: seb@henly.ai
To: {{ $json.to }}
Subject: {{ $json.subject }}
HTML: {{ $json.html }}
Text: {{ $json.text }}
```

### 4. Success Log Node
```
Type: Code
Name: Success Log
Language: JavaScript
```

### 5. Respond Node
```
Type: Respond to Webhook
Respond With: JSON
Response Body: {{ $json }}
```

## Supported Email Types

| Type | Description | Required Metadata |
|------|-------------|-------------------|
| `verification` | Email verification | `verificationUrl`, `fullName`, `organizationName` |
| `invitation` | Team invitation | `inviteUrl`, `inviterName`, `organizationName`, `expiresAt` |
| `welcome` | Welcome message | `dashboardUrl`, `userName`, `organizationName` |
| `password_reset` | Password reset | `resetUrl` |
| `organization_created` | Organization setup | `dashboardUrl`, `organizationName` |

## Webhook Data Format

```json
{
  "type": "verification",
  "to": "user@example.com",
  "subject": "Verify your email address - Henly AI",
  "html": "<html>...</html>",
  "text": "Plain text version...",
  "metadata": {
    "organizationName": "Company Name",
    "fullName": "User Name",
    "verificationUrl": "https://henly.ai/verify-email?token=...",
    "email": "user@example.com",
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

## SMTP Configuration

### Gmail
```
Host: smtp.gmail.com
Port: 587
Security: TLS
Username: your-email@gmail.com
Password: your-app-password
```

### SendGrid
```
Host: smtp.sendgrid.net
Port: 587
Security: TLS
Username: apikey
Password: your-sendgrid-api-key
```

### Outlook/Hotmail
```
Host: smtp-mail.outlook.com
Port: 587
Security: TLS
Username: your-email@outlook.com
Password: your-password
```

## Environment Variables

```bash
# Required
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/send-email
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Optional
NODE_ENV=production
```

## Testing Commands

```bash
# Test webhook format
node test-webhook-format.js

# Test with n8n
node test-verification-email.js

# Test email service
node test-email-service.js
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Webhook not receiving data | Check URL, verify workflow is active |
| SMTP connection failed | Verify credentials, check app passwords |
| Email not sent | Check node connections, verify data flow |
| Template errors | Check HTML syntax in Process Data node |
| Missing metadata | Ensure all required fields are provided |

## Workflow Status

- ✅ Webhook configured
- ✅ Data processing working
- ✅ Email templates ready
- ✅ SMTP configured
- ✅ Success logging active
- ✅ Response handling complete

## Next Steps

1. Import workflow JSON into n8n
2. Configure SMTP credentials
3. Activate workflow
4. Test with provided scripts
5. Update environment variables
6. Deploy to production
