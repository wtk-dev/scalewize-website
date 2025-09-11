# Supabase Setup Guide for Henly AI

This guide will help you set up your Supabase database with the correct tables, Row Level Security (RLS) policies, and functions for the Henly AI platform.

## 1. Database Tables

Run these SQL commands in your Supabase SQL editor to create the required tables:

### Organizations Table
```sql
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  stripe_customer_id TEXT,
  monthly_usage_limit INTEGER DEFAULT 10000,
  current_monthly_usage INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb
);

-- Create index for slug lookups
CREATE INDEX idx_organizations_slug ON organizations(slug);
```

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sign_in TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX idx_profiles_email ON profiles(email);
```

### Chat Sessions Table
```sql
CREATE TABLE chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived'))
);

-- Create indexes
CREATE INDEX idx_chat_sessions_organization_id ON chat_sessions(organization_id);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_session_id ON chat_sessions(session_id);
```

### Usage Metrics Table
```sql
CREATE TABLE usage_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost_usd DECIMAL(10,4) NOT NULL DEFAULT 0,
  session_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_usage_metrics_organization_id ON usage_metrics(organization_id);
CREATE INDEX idx_usage_metrics_user_id ON usage_metrics(user_id);
CREATE INDEX idx_usage_metrics_date ON usage_metrics(date);
CREATE UNIQUE INDEX idx_usage_metrics_org_user_date ON usage_metrics(organization_id, user_id, date);
```

### Billing Records Table
```sql
CREATE TABLE billing_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  stripe_invoice_id TEXT NOT NULL,
  amount_usd DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_billing_records_organization_id ON billing_records(organization_id);
CREATE INDEX idx_billing_records_stripe_invoice_id ON billing_records(stripe_invoice_id);
```

### API Keys Table
```sql
CREATE TABLE api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_api_keys_organization_id ON api_keys(organization_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
```

## 2. Row Level Security (RLS) Policies

Enable RLS on all tables and create the following policies:

### Enable RLS
```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
```

### Organizations Policies
```sql
-- Users can view their own organization
CREATE POLICY "Users can view own organization" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Only super admins can create organizations (handled in signup flow)
CREATE POLICY "Super admins can create organizations" ON organizations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Organization admins can update their organization
CREATE POLICY "Admins can update own organization" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

### Profiles Policies
```sql
-- Users can view profiles in their organization
CREATE POLICY "Users can view organization profiles" ON profiles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Allow profile creation during signup
CREATE POLICY "Allow profile creation" ON profiles
  FOR INSERT WITH CHECK (true);
```

### Chat Sessions Policies
```sql
-- Users can view chat sessions in their organization
CREATE POLICY "Users can view organization chat sessions" ON chat_sessions
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Users can create chat sessions in their organization
CREATE POLICY "Users can create chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Users can update their own chat sessions
CREATE POLICY "Users can update own chat sessions" ON chat_sessions
  FOR UPDATE USING (user_id = auth.uid());
```

### Usage Metrics Policies
```sql
-- Users can view usage metrics in their organization
CREATE POLICY "Users can view organization usage metrics" ON usage_metrics
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Users can create usage metrics in their organization
CREATE POLICY "Users can create usage metrics" ON usage_metrics
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid()
    )
  );
```

### Billing Records Policies
```sql
-- Organization admins can view billing records
CREATE POLICY "Admins can view organization billing" ON billing_records
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

### API Keys Policies
```sql
-- Organization admins can manage API keys
CREATE POLICY "Admins can manage organization API keys" ON api_keys
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

## 3. Database Functions

Create these helper functions for common operations:

### Update Usage Function
```sql
CREATE OR REPLACE FUNCTION update_organization_usage(
  org_id UUID,
  tokens_used INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE organizations 
  SET current_monthly_usage = current_monthly_usage + tokens_used,
      updated_at = NOW()
  WHERE id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Check Usage Limit Function
```sql
CREATE OR REPLACE FUNCTION check_usage_limit(org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_usage INTEGER;
  usage_limit INTEGER;
BEGIN
  SELECT current_monthly_usage, monthly_usage_limit 
  INTO current_usage, usage_limit
  FROM organizations 
  WHERE id = org_id;
  
  RETURN current_usage < usage_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 4. Triggers

### Update Timestamps Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON organizations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at 
  BEFORE UPDATE ON chat_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 5. Testing Your Setup

After setting up your database, run the test script:

```bash
npm run test:supabase
```

This will verify:
- ✅ Database connection
- ✅ Table accessibility
- ✅ RLS policies
- ✅ Authentication system
- ✅ Test data creation and cleanup

## 6. Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 7. Next Steps

1. **Test the setup** with `npm run test:supabase`
2. **Start development** with `npm run dev`
3. **Create your first organization** by signing up at `/signup`
4. **Test authentication** by logging in at `/login`

## Troubleshooting

### Common Issues:

1. **RLS Policy Errors**: Make sure all policies are created correctly
2. **Foreign Key Errors**: Ensure tables are created in the correct order
3. **Permission Errors**: Check that your API keys have the correct permissions
4. **Connection Errors**: Verify your environment variables are correct

### Getting Help:

- Check the Supabase logs in your project dashboard
- Review the test script output for specific error messages
- Ensure all SQL commands executed successfully 