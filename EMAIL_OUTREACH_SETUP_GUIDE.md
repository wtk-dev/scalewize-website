# Email Outreach Setup Guide

## 🚨 IMPORTANT: n8n Import Issue Fixed

The original workflow had missing properties that caused the "Could not find property option" error. I've created a fixed version that matches n8n's expected structure.

## 📋 Prerequisites

Before starting, ensure you have:
- [ ] Your Supabase URL and anon key
- [ ] Your organization ID (UUID)
- [ ] n8n instance running (version 1.106.3 or higher)
- [ ] Gmail OAuth2 credentials configured in n8n

## 🗄️ Step 1: Database Migration

Run the fixed migration script to add email outreach functionality:

```bash
# Connect to your Supabase database and run:
psql -d your_database -f scripts/email-outreach-migration-fixed.sql
```

This migration will:
- ✅ Add outreach fields to the `leads` table
- ✅ Create `outreach_campaigns`, `outreach_daily_stats`, and `outreach_messages` tables
- ✅ Set up proper RLS policies for all tables
- ✅ Create performance indexes
- ✅ Add helper functions for outreach logic

## 🔧 Step 2: Configure n8n Workflow

### 2.1 Import the Fixed Workflow

1. **Download**: `Unified Outreach - Supabase Fixed.json`
2. **Import** into n8n (this version fixes the import error)
3. **Activate** the workflow

### 2.2 Update Placeholders

Replace these placeholders in the workflow:

| Placeholder | Replace With | Location |
|-------------|--------------|----------|
| `YOUR_DOMAIN` | Your actual domain | All HTTP Request URLs |
| `YOUR_SUPABASE_ANON_KEY` | Your Supabase anon key | Authorization headers |
| `YOUR_ORGANIZATION_ID` | Your organization UUID | "Get Organization" node |
| `YOUR_HTTP_HEADER_AUTH_ID` | Your n8n HTTP Header Auth credential ID | All HTTP Request nodes |

### 2.3 Configure Credentials

1. **HTTP Header Auth**:
   - Name: "Supabase API Auth"
   - Header Name: "Authorization"
   - Header Value: "Bearer YOUR_SUPABASE_ANON_KEY"

2. **Gmail OAuth2** (already configured):
   - Keep existing Gmail credentials

## 🧪 Step 3: Test the Setup

### 3.1 Test API Endpoints

Test each endpoint to ensure they work:

```bash
# Test leads endpoint
curl -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  "https://your-domain.com/api/outreach/leads?organizationId=YOUR_ORGANIZATION_ID"

# Test campaigns endpoint
curl -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  "https://your-domain.com/api/outreach/campaigns?organizationId=YOUR_ORGANIZATION_ID"

# Test daily stats endpoint
curl -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  "https://your-domain.com/api/outreach/daily-stats?organizationId=YOUR_ORGANIZATION_ID"
```

### 3.2 Test with Sample Data

Add some test leads to your database:

```sql
-- Insert test leads
INSERT INTO public.leads (
  organization_id, 
  user_id, 
  email, 
  first_name, 
  last_name, 
  company,
  status
) VALUES (
  'YOUR_ORGANIZATION_ID',
  'YOUR_USER_ID',
  'test@example.com',
  'Test',
  'User',
  'Test Company',
  'PENDING'
);
```

### 3.3 Run Test Workflow

1. **Manual Trigger**: Run the workflow manually first
2. **Check Logs**: Verify each step executes successfully
3. **Check Database**: Confirm leads are updated correctly

## 🔍 Step 4: Verify Everything Works

### 4.1 Check Database Tables

```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('outreach_campaigns', 'outreach_daily_stats', 'outreach_messages');

-- Check RLS policies
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('leads', 'outreach_campaigns', 'outreach_daily_stats', 'outreach_messages')
ORDER BY tablename, policyname;
```

### 4.2 Check API Responses

All endpoints should return JSON responses without errors:

- ✅ `/api/outreach/leads` - Returns available leads
- ✅ `/api/outreach/campaigns` - Returns active campaigns  
- ✅ `/api/outreach/daily-stats` - Returns daily statistics
- ✅ `/api/outreach/update-lead` - Updates lead status

## 🚀 Step 5: Go Live

### 5.1 Activate Workflow

1. **Enable** the workflow in n8n
2. **Monitor** the first few runs
3. **Check** email delivery and database updates

### 5.2 Monitor Performance

```sql
-- Check daily stats
SELECT date_et, or1_count, or2_count, or3_count, total_sent 
FROM public.outreach_daily_stats 
WHERE organization_id = 'YOUR_ORGANIZATION_ID' 
ORDER BY date_et DESC LIMIT 7;

-- Check lead status distribution
SELECT outreach_stage, COUNT(*) 
FROM public.leads 
WHERE organization_id = 'YOUR_ORGANIZATION_ID' 
GROUP BY outreach_stage;
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Could not find property option" Error**:
   - ✅ **Fixed**: Use `Unified Outreach - Supabase Fixed.json`
   - The original had missing n8n properties

2. **RLS Policy Errors**:
   - ✅ **Fixed**: Migration includes proper RLS policies
   - All tables have organization-based access control

3. **API Authentication Errors**:
   - Check Supabase anon key is correct
   - Verify organization ID matches your database

4. **Gmail Send Errors**:
   - Verify Gmail OAuth2 credentials in n8n
   - Check Gmail API quotas

### Debug Commands

```sql
-- Check if migration completed
SELECT 'Migration Status' as check_type, 
  COUNT(*) as leads_count,
  (SELECT COUNT(*) FROM public.outreach_campaigns) as campaigns_count
FROM public.leads;

-- Check RLS is working
SET row_security = on;
SELECT COUNT(*) FROM public.leads WHERE organization_id = 'YOUR_ORGANIZATION_ID';
```

## 📊 Monitoring & Maintenance

### Daily Monitoring

- **Check daily stats**: Monitor send counts and caps
- **Review lead progression**: OR1 → OR2 → OR3 → Complete
- **Monitor email delivery**: Check Gmail logs for bounces

### Weekly Maintenance

- **Clean up old data**: Archive completed campaigns
- **Review performance**: Check query execution times
- **Update campaigns**: Modify message content or caps as needed

## 🔒 Security Notes

- ✅ **RLS Enabled**: All tables have proper row-level security
- ✅ **Organization Isolation**: Users can only access their organization's data
- ✅ **API Authentication**: All endpoints require valid Supabase auth
- ✅ **Input Validation**: All API inputs are validated and sanitized

## 📈 Performance Optimizations

- ✅ **Database Indexes**: Optimized for common query patterns
- ✅ **Connection Pooling**: Supabase handles connection management
- ✅ **Caching**: Daily stats are cached for performance
- ✅ **Batch Operations**: Single API calls for multiple updates

---

## 🎯 Success Checklist

- [ ] Database migration completed successfully
- [ ] n8n workflow imported without errors
- [ ] All placeholders replaced with real values
- [ ] API endpoints responding correctly
- [ ] Test leads processed successfully
- [ ] Gmail integration working
- [ ] RLS policies functioning
- [ ] Workflow running automatically
- [ ] Monitoring setup complete

Your email outreach system is now ready to scale! 🚀
