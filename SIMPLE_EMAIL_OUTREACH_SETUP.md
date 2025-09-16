# Simple Email Outreach Setup

## 🎯 **Minimal Changes, Maximum Impact**

This approach adds **only the essential fields** to your existing `leads` table and creates **one small table** for tracking messages. No daily caps, no complex campaigns - just clean, simple email outreach.

## 📋 **What This Does**

- ✅ **Adds 12 fields** to your existing `leads` table
- ✅ **Creates 1 small table** (`outreach_messages`) for tracking
- ✅ **No daily caps** - sends as many emails as you want
- ✅ **Uses existing RLS policies** - no security changes needed
- ✅ **Minimal database changes** - keeps your schema clean

## 🗄️ **Step 1: Run the Simple Migration**

```bash
# Copy the migration script to your Supabase SQL editor and run it
# OR if you have psql access:
psql -d your_database -f scripts/email-outreach-simple-migration.sql
```

**What it adds to your `leads` table:**
- `followup_trigger` - Boolean for OR1 → OR2 progression
- `followup_date` - When to send OR2 email
- `followup_2_trigger` - Boolean for OR2 → OR3 progression  
- `followup_2_date` - When to send OR3 email
- `or1_sent`, `or2_sent`, `or3_sent` - Track which emails sent
- `or1_sent_at`, `or2_sent_at`, `or3_sent_at` - Timestamps
- `thread_id` - Gmail thread ID for replies
- `outreach_stage` - Current stage (OR1, OR2, OR3, COMPLETE)

**What it creates:**
- `outreach_messages` - Small table to track sent emails (optional)

## 🔧 **Step 2: Import the Simple Workflow**

1. **Download**: `Unified Outreach - Simple Supabase.json`
2. **Import** into n8n (this version is much simpler)
3. **Replace placeholders**:
   - `YOUR_DOMAIN` → Your actual domain
   - `YOUR_SUPABASE_ANON_KEY` → Your Supabase anon key
   - `YOUR_ORGANIZATION_ID` → Your organization UUID
   - `YOUR_HTTP_HEADER_AUTH_ID` → Your n8n HTTP Header Auth credential ID

## 🧪 **Step 3: Test the Setup**

### Test the API endpoints:

```bash
# Test the simple leads endpoint
curl -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  "https://your-domain.com/api/outreach/leads-simple?organizationId=YOUR_ORGANIZATION_ID"

# Test updating a lead
curl -X POST -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"leadId":"lead-uuid","organizationId":"org-uuid","stage":"OR1","followupDate":"2024-01-15"}' \
  "https://your-domain.com/api/outreach/update-lead-simple"
```

## 📊 **How It Works**

### **Lead Progression:**
1. **OR1**: New lead gets first email, sets `followup_trigger=true`, schedules OR2 date
2. **OR2**: When `followup_date` arrives, sends follow-up, sets `followup_2_trigger=true`, schedules OR3 date  
3. **OR3**: When `followup_2_date` arrives, sends final email, marks as `COMPLETE`

### **No Daily Caps:**
- Sends **1 email per minute** during business hours (9-5 ET, M-F)
- **No artificial limits** - scales with your lead volume
- **Human-like timing** - random intervals, business hours only

### **Simple Tracking:**
- All data stays in your existing `leads` table
- Optional `outreach_messages` table for detailed email tracking
- **No complex campaign management** - just email sequences

## 🔍 **Verify Everything Works**

```sql
-- Check the new fields were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND column_name IN ('followup_trigger', 'or1_sent', 'outreach_stage');

-- Check some test leads
SELECT id, email, first_name, outreach_stage, or1_sent, or2_sent, or3_sent
FROM leads 
WHERE organization_id = 'YOUR_ORGANIZATION_ID'
LIMIT 5;
```

## 🚀 **Go Live**

1. **Run the migration** ✅
2. **Import the workflow** ✅  
3. **Update placeholders** ✅
4. **Test the endpoints** ✅
5. **Activate the workflow** 🚀

## 🎯 **Benefits of This Approach**

- **Minimal Database Changes**: Only adds fields to existing table
- **No Daily Caps**: Scales naturally with your lead volume
- **Simple Maintenance**: Easy to understand and modify
- **Existing Security**: Uses your current RLS policies
- **Clean Schema**: No unnecessary tables or complexity

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **"Could not find property option" Error**:
   - ✅ **Fixed**: Use `Unified Outreach - Simple Supabase.json`

2. **API Authentication Errors**:
   - Check Supabase anon key is correct
   - Verify organization ID matches your database

3. **No Leads Found**:
   - Make sure you have leads with valid email addresses
   - Check the `get_available_outreach_leads` function works

### **Debug Commands:**

```sql
-- Test the function directly
SELECT * FROM get_available_outreach_leads('YOUR_ORGANIZATION_ID', 10);

-- Check lead status
SELECT outreach_stage, COUNT(*) 
FROM leads 
WHERE organization_id = 'YOUR_ORGANIZATION_ID' 
GROUP BY outreach_stage;
```

---

## ✅ **Success Checklist**

- [ ] Migration completed successfully
- [ ] n8n workflow imported without errors
- [ ] All placeholders replaced with real values
- [ ] API endpoints responding correctly
- [ ] Test leads processed successfully
- [ ] Workflow running automatically

**Your simple email outreach system is ready!** 🎉

This approach gives you all the functionality you need without cluttering your database or adding unnecessary complexity.
