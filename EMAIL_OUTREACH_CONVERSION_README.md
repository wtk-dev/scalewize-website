# Email Outreach Workflow Conversion: Google Sheets to Supabase

This document outlines the complete conversion of the email outreach workflow from Google Sheets to Supabase integration.

## Overview

The original workflow used Google Sheets as a backend for managing leads, tracking outreach status, and maintaining daily send caps. This has been converted to use Supabase with dedicated API endpoints and database tables for improved scalability, reliability, and security.

## Database Changes

### New Tables Added

#### 1. `outreach_campaigns`
Manages email outreach campaigns with settings like:
- Daily send caps per stage (OR1, OR2, OR3)
- Business hours and timezone
- Send minute blocks
- Campaign status and configuration

#### 2. `outreach_daily_stats`
Tracks daily send counts with:
- Date-based tracking in ET timezone
- Separate counters for OR1, OR2, OR3 stages
- Automatic rollover at midnight ET

#### 3. `outreach_messages`
Records all sent emails with:
- Message content and metadata
- Thread IDs for Gmail integration
- Send status and timestamps
- Campaign association

### Enhanced `leads` Table

Added outreach-specific fields:
- `followup_trigger` - Boolean for OR2 eligibility
- `followup_date` - When to send OR2 follow-up
- `followup_2_trigger` - Boolean for OR3 eligibility
- `followup_2_date` - When to send OR3 follow-up
- `or1_sent`, `or2_sent`, `or3_sent` - Stage completion flags
- `thread_id`, `email_thread_id` - Gmail threading support
- `or1_sent_at`, `or2_sent_at`, `or3_sent_at` - Timestamps
- `outreach_stage` - Current stage (OR1, OR2, OR3, COMPLETE)

## API Endpoints

### `/api/outreach/leads`
**GET** - Retrieve available leads for outreach
- Query parameters: `organizationId`, `campaignName`, `maxResults`, `stage`
- Returns filtered leads based on outreach criteria and daily caps

### `/api/outreach/update-lead`
**POST** - Update lead status after sending email
- Updates sent flags, timestamps, follow-up dates, and thread IDs
- Automatically records outreach message

### `/api/outreach/daily-stats`
**GET** - Retrieve current daily statistics
**POST** - Increment daily send counters

### `/api/outreach/campaigns`
**GET** - Retrieve active outreach campaigns for organization

## Migration Steps

### 1. Database Migration
Run the migration script:
```sql
-- Execute the migration file
\i scripts/email-outreach-migration.sql
```

### 2. Environment Setup
Add these environment variables to your `.env` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. n8n Workflow Import
1. Import `Unified Outreach - Supabase.json` into n8n
2. Update the following placeholders in the workflow:
   - `YOUR_DOMAIN` → Your actual domain (e.g., `your-app.vercel.app`)
   - `YOUR_SUPABASE_ANON_KEY` → Your Supabase anon key
   - `YOUR_ORGANIZATION_ID` → Your organization's UUID
   - `YOUR_GMAIL_CREDENTIAL_ID` → Your Gmail OAuth2 credential ID

### 4. Credentials Setup
In n8n, configure:
1. **HTTP Request Authentication**: Set up header authentication with `Authorization: Bearer YOUR_SUPABASE_ANON_KEY`
2. **Gmail OAuth2**: Ensure Gmail credentials are properly configured

## Workflow Changes

### Key Differences from Original

1. **Data Source**: HTTP API calls replace Google Sheets nodes
2. **Filtering**: Server-side filtering with database queries
3. **State Management**: Database-backed daily stats instead of workflow static data
4. **Error Handling**: Improved error handling with proper HTTP status codes
5. **Scalability**: Database indexes and optimized queries for better performance

### Node Mapping

| Original Node | New Node | Purpose |
|---------------|----------|---------|
| Google Sheets - OR1 pool | HTTP Request - Get OR1 Leads | Fetch eligible leads |
| Google Sheets - OR2 pool | HTTP Request - Get OR2 Leads | Fetch follow-up eligible leads |
| Google Sheets - OR3 pool | HTTP Request - Get OR3 Leads | Fetch final follow-up eligible leads |
| Filter OR1/OR2/OR3 | HTTP Request - Get Leads + Filter by Caps | Combined filtering logic |
| Google Sheets - Update OR1/OR2/OR3 | HTTP Request - Update Lead | Update lead status |
| Bump Counter OR1/OR2/OR3 | HTTP Request - Update Daily Stats | Track daily sends |

## Security Considerations

### Row Level Security (RLS)
All outreach tables have RLS policies ensuring users can only access data from their organization.

### API Authentication
- All endpoints require proper Supabase authentication
- Organization-based access control
- Input validation with Zod schemas

### Data Validation
- UUID validation for organization and lead IDs
- Email format validation
- Date format validation
- Enum validation for stages and statuses

## Performance Optimizations

### Database Indexes
```sql
CREATE INDEX idx_leads_outreach_fields ON public.leads(organization_id, followup_trigger, followup_date, followup_2_trigger, followup_2_date, or1_sent, or2_sent, or3_sent);
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_outreach_daily_stats_lookup ON public.outreach_daily_stats(organization_id, campaign_id, date_et);
```

### Query Optimization
- Efficient filtering with indexed columns
- Pagination support with `maxResults` parameter
- Single queries instead of multiple sheet operations

### Caching Strategy
- Daily stats cached in database with automatic updates
- Campaign settings cached in workflow memory
- Lead data filtered server-side to reduce payload size

## Monitoring and Maintenance

### Daily Stats Tracking
Monitor daily send volumes:
```sql
SELECT
  date_et,
  or1_count,
  or2_count,
  or3_count,
  total_sent
FROM outreach_daily_stats
WHERE organization_id = 'your-org-id'
ORDER BY date_et DESC
LIMIT 30;
```

### Campaign Performance
Track campaign effectiveness:
```sql
SELECT
  oc.campaign_name,
  COUNT(om.id) as total_sent,
  COUNT(CASE WHEN om.stage = 'OR1' THEN 1 END) as or1_sent,
  COUNT(CASE WHEN om.stage = 'OR2' THEN 1 END) as or2_sent,
  COUNT(CASE WHEN om.stage = 'OR3' THEN 1 END) as or3_sent
FROM outreach_campaigns oc
LEFT JOIN outreach_messages om ON oc.id = om.campaign_id
WHERE oc.organization_id = 'your-org-id'
GROUP BY oc.id, oc.campaign_name;
```

### Lead Progress Tracking
Monitor lead progression through stages:
```sql
SELECT
  outreach_stage,
  COUNT(*) as lead_count,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400) as avg_days_in_stage
FROM leads
WHERE organization_id = 'your-org-id'
GROUP BY outreach_stage
ORDER BY outreach_stage;
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check Supabase authentication and organization access
2. **No leads returned**: Verify lead data has proper email addresses and outreach flags
3. **Daily caps not working**: Check timezone settings and daily stats table
4. **Gmail threading issues**: Ensure thread IDs are properly captured and stored

### Debug Steps

1. Check API endpoint responses in n8n workflow
2. Verify database data with direct SQL queries
3. Review n8n workflow execution logs
4. Check Supabase logs for API errors

## Future Enhancements

### Potential Improvements
1. **Bulk Operations**: Batch lead updates for better performance
2. **Advanced Analytics**: Response tracking and conversion metrics
3. **A/B Testing**: Multiple campaign variants with performance tracking
4. **Smart Scheduling**: AI-powered optimal send times
5. **Integration APIs**: Webhooks for CRM integrations

### Scaling Considerations
1. **Database Optimization**: Partitioning for large lead databases
2. **Caching Layer**: Redis for frequently accessed campaign data
3. **Queue System**: Background processing for high-volume sending
4. **Multi-region**: Global deployment with regional databases

## Migration Checklist

- [ ] Run database migration script
- [ ] Update environment variables
- [ ] Import new n8n workflow
- [ ] Configure n8n credentials
- [ ] Test workflow with sample data
- [ ] Monitor daily stats and performance
- [ ] Train team on new system
- [ ] Set up monitoring and alerts

## Support

For issues with the conversion:
1. Check this README for common solutions
2. Review n8n workflow execution logs
3. Examine Supabase query logs
4. Test API endpoints individually
5. Verify database constraints and indexes

The new Supabase-based system provides better reliability, scalability, and maintainability compared to the Google Sheets approach.
