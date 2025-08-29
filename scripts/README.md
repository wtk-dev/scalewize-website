# LinkedIn Lead Status Update Scripts

These scripts update lead statuses after importing new LinkedIn messages. Run them every time you import new messages from LinkedIn.

## 📋 Prerequisites

1. **Supabase Setup**: Ensure your Supabase project is configured with the correct tables (`leads` and `messages`)
2. **Environment Variables**: Make sure your `.env.local` file has the required Supabase credentials
3. **Message Types**: Ensure your messages have the correct `message_type` values:
   - `connection_request` - Connection requests sent
   - `first_message` - First messages sent after connection
   - `response` - Responses received from leads

## 🚀 How to Use

### Option 1: SQL Script (Recommended for one-time updates)

1. **Open your Supabase SQL Editor**
2. **Copy and paste** the contents of `update-lead-statuses-after-import.sql`
3. **Run the script**
4. **Review the results** - The script will show status distribution and summary statistics

### Option 2: JavaScript Script (Recommended for automation)

1. **Navigate to the scripts directory**:
   ```bash
   cd scripts
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

3. **Run the script**:
   ```bash
   node update-lead-statuses.js
   ```

## 📊 What the Scripts Do

### 1. **Reset All Statuses**
- Sets all leads back to `SENT` status
- Clears all timestamps to start fresh

### 2. **Update Connection Requests**
- Finds the earliest connection request for each lead
- Updates `connection_request_sent_at` timestamp

### 3. **Update Connections**
- Finds the earliest first message for each lead
- Updates `first_message_sent_at` timestamp
- Changes status to `CONNECTED`

### 4. **Update Responses**
- Identifies leads who have responded
- Changes status to `RESPONDED`

### 5. **Update Active Conversations**
- Identifies leads with multiple responses
- Changes status to `ACTIVE`

### 6. **Update Last Contact**
- Finds the most recent message for each lead
- Updates `last_contact_at` timestamp

## 📈 Status Flow

```
SENT → CONNECTED → RESPONDED → ACTIVE
  ↓         ↓           ↓         ↓
Connection  First      Response   Multiple
Request    Message    Received   Responses
```

## 🔧 Status Definitions

- **SENT**: Connection request sent, no response yet
- **CONNECTED**: First message sent after connection accepted
- **RESPONDED**: Lead has sent at least one response
- **ACTIVE**: Lead has sent multiple responses (ongoing conversation)
- **BOOKED**: Meeting scheduled (manual status)
- **CLOSED**: Deal closed (manual status)

## 📊 Expected Output

The scripts will show:

1. **Status Distribution**:
   ```
   SENT: 150 (60.0%)
   CONNECTED: 45 (18.0%)
   RESPONDED: 35 (14.0%)
   ACTIVE: 20 (8.0%)
   ```

2. **Summary Statistics**:
   ```
   Total Leads: 250
   Connection Requests Sent: 200
   Connections Made: 45
   Responses Received: 55
   Active Conversations: 55
   ```

## ⚠️ Important Notes

1. **Run After Import**: Always run these scripts after importing new LinkedIn messages
2. **Backup First**: Consider backing up your data before running the scripts
3. **Test Environment**: Test on a development environment first
4. **Message Types**: Ensure your imported messages have correct `message_type` values
5. **LinkedIn URLs**: Make sure leads have valid `linkedin_url` values for proper matching

## 🔄 Automation

You can automate this process by:

1. **Scheduling**: Set up a cron job to run the JavaScript script
2. **Webhook**: Trigger the script via webhook after message import
3. **API Integration**: Call the script from your LinkedIn import process

## 🐛 Troubleshooting

### Common Issues:

1. **"Constraint violation"**: The SQL script handles this automatically
2. **"Column doesn't exist"**: The script adds missing columns automatically
3. **"No data updated"**: Check that your messages have correct `message_type` values
4. **"Organization ID is null"**: Ensure all leads have valid organization IDs

### Debug Steps:

1. **Check message types**: Verify all messages have `connection_request`, `first_message`, or `response`
2. **Check LinkedIn URLs**: Ensure leads and messages have matching LinkedIn URLs
3. **Check organization IDs**: Verify all records have valid organization IDs
4. **Review logs**: The JavaScript script provides detailed logging

## 📞 Support

If you encounter issues:

1. Check the console output for error messages
2. Verify your Supabase connection and permissions
3. Ensure your data structure matches the expected schema
4. Test with a small subset of data first 