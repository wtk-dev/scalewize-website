# 📧 Henly AI Email System Setup Guide

## 🎯 **Overview**

This guide will help you set up a robust email system for Henly AI using Supabase's email templates and custom SMTP configuration. The system includes:

- **Invitation emails** for new team members
- **Welcome emails** when users join organizations
- **Professional HTML templates** with Henly branding
- **Fallback SMTP service** for reliability

## 🚨 **Current Issue**

Your emails aren't being received because you're using Supabase's **built-in email service**, which has rate limits and is "not meant to be used for production apps."

## ✅ **Solution: Configure Custom SMTP with Supabase Email System**

### **Step 1: Choose an Email Service Provider (ESP)**

**Recommended options:**

1. **SendGrid** (Most Popular)
   - Generous free tier (100 emails/day)
   - Excellent deliverability
   - Easy setup

2. **Mailgun**
   - 5,000 emails/month free
   - Good for transactional emails
   - Developer-friendly

3. **Postmark**
   - Excellent deliverability
   - Specialized for transactional emails
   - Higher cost but very reliable

4. **AWS SES**
   - Very cost-effective
   - Requires AWS setup
   - Good for high volume

### **Step 2: Get SMTP Credentials**

Once you have an ESP account, you'll need:

- **SMTP Host** (e.g., `smtp.sendgrid.net`)
- **SMTP Port** (usually `587` or `465`)
- **SMTP Username** (often an API key)
- **SMTP Password** (often the same API key)
- **Sender Email** (e.g., `no-reply@scalewize.ai`)

### **Step 3: Configure Supabase SMTP**

1. **Go to your Supabase project dashboard**
2. **Navigate to Authentication → Emails**
3. **Click "Set up custom SMTP server"**
4. **Enter your SMTP credentials:**
   ```
   SMTP Host: smtp.sendgrid.net (or your ESP's host)
   SMTP Port: 587
   SMTP Username: your_api_key
   SMTP Password: your_api_key
   Sender Email: no-reply@scalewize.ai
   ```
5. **Save the settings**

### **Step 4: Configure Email Templates**

#### **A. Invite User Template**

1. **Click the "Invite user" tab** in Supabase
2. **Subject heading:** `You're invited to join {{ .SiteURL }} on Henly AI`
3. **Message body (HTML):**

```html
<h2>You're Invited!</h2>

<p>{{ .SiteURL }} has invited you to join their organization on Henly AI. 
You'll have access to AI-powered chatbots, analytics, and business automation tools.</p>

<p><strong>Organization:</strong> {{ .SiteURL }}</p>
<p><strong>Invited by:</strong> {{ .SiteURL }}</p>

<p><a href="{{ .ConfirmationLink }}" style="
  display: inline-block; 
  background: linear-gradient(135deg, #595F39 0%, #6B7357 100%); 
  color: white; 
  text-decoration: none; 
  padding: 16px 32px; 
  border-radius: 8px; 
  font-weight: 600; 
  font-size: 16px; 
  margin: 20px 0;">
  Accept Invitation
</a></p>

<p><strong>Important:</strong> This invitation expires in 7 days. 
Please accept it before then to join the organization.</p>

<p>If you have any questions, please contact your organization administrator.</p>

<hr>
<p><em>Powered by Henly AI - Simplifying AI for businesses</em></p>
```

#### **B. Confirm Signup Template**

1. **Click the "Confirm signup" tab**
2. **Subject heading:** `Welcome to Henly AI - Confirm your account`
3. **Message body (HTML):**

```html
<h2>Welcome to Henly AI!</h2>

<p>Thank you for signing up! Please confirm your email address to get started.</p>

<p><a href="{{ .ConfirmationURL }}" style="
  display: inline-block; 
  background: linear-gradient(135deg, #595F39 0%, #6B7357 100%); 
  color: white; 
  text-decoration: none; 
  padding: 16px 32px; 
  border-radius: 8px; 
  font-weight: 600; 
  font-size: 16px; 
  margin: 20px 0;">
  Confirm Email Address
</a></p>

<p>If you didn't create this account, you can safely ignore this email.</p>

<hr>
<p><em>Henly AI - Simplifying AI for businesses</em></p>
```

#### **C. Magic Link Template**

1. **Click the "Magic Link" tab**
2. **Subject heading:** `Sign in to Henly AI`
3. **Message body (HTML):**

```html
<h2>Sign in to Henly AI</h2>

<p>Click the link below to sign in to your account:</p>

<p><a href="{{ .ConfirmationURL }}" style="
  display: inline-block; 
  background: linear-gradient(135deg, #595F39 0%, #6B7357 100%); 
  color: white; 
  text-decoration: none; 
  padding: 16px 32px; 
  border-radius: 8px; 
  font-weight: 600; 
  font-size: 16px; 
  margin: 20px 0;">
  Sign In
</a></p>

<p>This link will expire in 1 hour for security reasons.</p>

<p>If you didn't request this sign-in link, you can safely ignore this email.</p>

<hr>
<p><em>Henly AI - Simplifying AI for businesses</em></p>
```

#### **D. Reset Password Template**

1. **Click the "Reset Password" tab**
2. **Subject heading:** `Reset your Henly AI password`
3. **Message body (HTML):**

```html
<h2>Reset Your Password</h2>

<p>We received a request to reset your password. Click the button below to create a new password:</p>

<p><a href="{{ .ConfirmationURL }}" style="
  display: inline-block; 
  background: linear-gradient(135deg, #595F39 0%, #6B7357 100%); 
  color: white; 
  text-decoration: none; 
  padding: 16px 32px; 
  border-radius: 8px; 
  font-weight: 600; 
  font-size: 16px; 
  margin: 20px 0;">
  Reset Password
</a></p>

<p>This link will expire in 1 hour for security reasons.</p>

<p>If you didn't request a password reset, you can safely ignore this email.</p>

<hr>
<p><em>Henly AI - Simplifying AI for businesses</em></p>
```

### **Step 5: Test the Email System**

1. **Send a test invitation** from your admin dashboard
2. **Check the recipient's inbox** (and spam folder)
3. **Verify email delivery** in your ESP's dashboard
4. **Test all email templates** to ensure they work

### **Step 6: Environment Variables (Optional)**

For advanced configuration, add these to your `.env.local`:

```bash
# SMTP Configuration (if using direct SMTP fallback)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_api_key
SMTP_PASS=your_api_key

# Email Configuration
NEXT_PUBLIC_APP_URL=https://scalewize-website.vercel.app
```

## 🔧 **Current Implementation Status**

### **✅ What's Working:**
- **Email service infrastructure** is in place
- **HTML templates** are ready and styled
- **Invitation system** creates records successfully
- **Fallback mechanisms** are implemented

### **🔄 What Needs Configuration:**
- **SMTP server setup** in Supabase
- **Email template customization** in Supabase dashboard
- **Testing** of the complete email flow

## 📱 **Mobile-Responsive Email Templates**

All email templates are designed to work perfectly on:
- **Desktop computers**
- **Tablets**
- **Mobile phones**
- **Email clients** (Gmail, Outlook, Apple Mail, etc.)

## 🎨 **Branding & Styling**

The email templates use:
- **Henly brand colors** (#595F39, #6B7357)
- **Professional typography** (system fonts for compatibility)
- **Modern design elements** (gradients, shadows, rounded corners)
- **Consistent spacing** and layout

## 🚀 **Next Steps**

1. **Choose an ESP** (SendGrid recommended for beginners)
2. **Get SMTP credentials** from your chosen provider
3. **Configure Supabase SMTP** settings
4. **Customize email templates** with the HTML provided above
5. **Test the complete flow** from invitation to user activation
6. **Monitor email delivery** and adjust as needed

## 🆘 **Troubleshooting**

### **Emails still not sending:**
- Check SMTP credentials in Supabase
- Verify ESP account is active
- Check ESP's sending limits
- Review Supabase logs for errors

### **Emails going to spam:**
- Verify sender domain with ESP
- Set up SPF/DKIM records
- Use consistent sender addresses
- Avoid spam trigger words

### **Template not rendering:**
- Check HTML syntax in Supabase
- Test with simple HTML first
- Verify template variables are correct
- Check email client compatibility

## 📞 **Support**

If you need help with:
- **ESP setup** - Contact your chosen provider's support
- **Supabase configuration** - Check Supabase documentation
- **Email templates** - Use the HTML provided above
- **General issues** - Check the troubleshooting section

---

**Your email system will be production-ready once you complete the SMTP configuration in Supabase!** 🎉
