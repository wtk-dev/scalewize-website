# Client Onboarding Guide - ScaleWize AI Platform

This guide explains how to onboard new clients to your multi-tenant AI platform, offering LibreChat and other AI agents as a service.

## 🚀 Quick Start for New Clients

### 1. Client Registration Flow

When a new client signs up, they automatically get:

```typescript
// Automatic organization creation
const newClient = {
  name: "Acme Corporation",
  domain: "acme-corp",
  plan_type: "professional", // starter, professional, enterprise
  librechat_config: {
    enabled_models: ["gpt-4", "claude-3"],
    custom_instructions: "You are Acme Corp's AI assistant...",
    features: {
      file_upload: true,
      code_interpreter: true,
      image_generation: true
    }
  }
}
```

### 2. Client Dashboard Access

Each client gets their own dashboard at:
```
https://yourdomain.com/dashboard?org=acme-corp
```

## 💼 Business Model & Pricing

### Plan Tiers

#### **Starter Plan - $99/month**
- ✅ GPT-3.5-turbo access
- ✅ 10,000 tokens/month
- ✅ Basic file upload
- ✅ 5 users max
- ✅ Email support

#### **Professional Plan - $299/month**
- ✅ GPT-4, Claude-3 access
- ✅ 100,000 tokens/month
- ✅ Code interpreter
- ✅ Image generation
- ✅ 25 users max
- ✅ Custom MCP servers
- ✅ Priority support

#### **Enterprise Plan - $999/month**
- ✅ All AI models (GPT-4-turbo, Claude-3-opus)
- ✅ 1,000,000 tokens/month
- ✅ Voice chat
- ✅ Unlimited users
- ✅ Custom knowledge bases
- ✅ Dedicated support
- ✅ White-label options

## 🔧 Technical Setup

### 1. Database Migration

Run the migration script in your Supabase SQL editor:

```sql
-- Copy and paste the contents of scripts/migrate-existing-schema.sql
```

### 2. Environment Configuration

Update your `.env.local`:

```env
# LibreChat Configuration
NEXT_PUBLIC_LIBRECHAT_URL=https://your-librechat-domain.com
LIBRECHAT_JWT_SECRET=your-super-secret-jwt-key

# Client-specific settings
NEXT_PUBLIC_APP_URL=https://yourdomain.com
ENABLE_CLIENT_ONBOARDING=true
```

### 3. LibreChat Deployment

Deploy LibreChat with multi-tenant support:

```bash
docker run -d \
  --name librechat \
  -p 3080:3080 \
  -e JWT_SECRET=your-super-secret-jwt-key \
  -e JWT_REFRESH_SECRET=your-super-secret-refresh-key \
  -e ALLOW_REGISTRATION=false \
  -e ENABLE_ORGANIZATIONS=true \
  -e ENABLE_KNOWLEDGE_BASES=true \
  -e ENABLE_MCP=true \
  ghcr.io/danny-avila/librechat:latest
```

## 👥 Client Onboarding Process

### Step 1: Client Signup

```typescript
// Client fills out signup form
const clientData = {
  organizationName: "Acme Corporation",
  adminEmail: "admin@acme.com",
  planType: "professional",
  estimatedUsers: 15
}

// System creates organization and admin user
const organization = await createOrganization(clientData)
const adminUser = await createAdminUser(clientData.adminEmail, organization.id)
```

### Step 2: Initial Configuration

```typescript
// Set up client-specific LibreChat configuration
await updateLibreChatConfig(organization.id, {
  custom_instructions: `You are Acme Corporation's AI assistant. 
  You help with customer support, sales, and internal operations.
  Always be professional and represent Acme Corp's values.`,
  enabled_models: ["gpt-4", "claude-3-sonnet"],
  features: {
    file_upload: true,
    code_interpreter: true,
    image_generation: true
  }
})
```

### Step 3: MCP Server Integration

```typescript
// Add client's internal systems
await addMCPServer(organization.id, {
  name: "Acme CRM",
  description: "Customer relationship management system",
  endpoint: "https://acme-crm.internal/api/mcp",
  capabilities: ["read_customers", "update_leads", "create_opportunities"]
})

await addMCPServer(organization.id, {
  name: "Acme Database",
  description: "Internal company database",
  endpoint: "https://acme-db.internal/api/mcp",
  capabilities: ["search_products", "read_inventory", "update_orders"]
})
```

### Step 4: Knowledge Base Setup

```typescript
// Create client knowledge bases
await addKnowledgeBase(organization.id, {
  name: "Acme Product Documentation",
  description: "Product specifications and user guides",
  type: "documentation"
})

await addKnowledgeBase(organization.id, {
  name: "Acme Sales Data",
  description: "Customer interactions and sales history",
  type: "sales_data"
})
```

### Step 5: User Invitation

```typescript
// Invite team members
const teamMembers = [
  "sales@acme.com",
  "support@acme.com",
  "marketing@acme.com"
]

for (const email of teamMembers) {
  await inviteUser(email, organization.id, "user")
}
```

## 🎯 Client Success Features

### 1. Custom Branding

```typescript
// Client-specific branding
const clientBranding = {
  logo: "https://acme.com/logo.png",
  primaryColor: "#0066cc",
  companyName: "Acme Corporation",
  customDomain: "chat.acme.com" // Optional
}
```

### 2. Usage Analytics

```typescript
// Track client usage
const usageMetrics = {
  organizationId: "acme-org-id",
  monthlyTokens: 45000,
  activeUsers: 12,
  chatSessions: 156,
  costUsd: 89.50
}
```

### 3. Support Integration

```typescript
// Client support system
const supportConfig = {
  prioritySupport: true, // For professional/enterprise
  dedicatedSlack: "acme-support",
  responseTime: "2 hours",
  escalationEmail: "support@acme.com"
}
```

## 📊 Client Management Dashboard

### Admin Features

```typescript
// View all clients
const clients = await supabase
  .from('organizations')
  .select(`
    *,
    profiles (count),
    usage_metrics (sum(tokens_used))
  `)
  .order('created_at', { ascending: false })

// Client usage overview
const clientUsage = await supabase
  .from('usage_metrics')
  .select(`
    organization_id,
    SUM(tokens_used) as total_tokens,
    SUM(cost_usd) as total_cost,
    COUNT(DISTINCT user_id) as active_users
  `)
  .group('organization_id')
```

### Client Analytics

```typescript
// Per-client analytics
const clientAnalytics = {
  totalChatSessions: 1247,
  averageTokensPerSession: 450,
  mostUsedModel: "gpt-4",
  topUsers: ["admin@acme.com", "sales@acme.com"],
  costTrend: "+12% this month"
}
```

## 🔒 Security & Compliance

### Data Isolation

- ✅ Complete data separation between clients
- ✅ Row Level Security (RLS) policies
- ✅ Organization-based access control
- ✅ Secure JWT authentication

### Compliance Features

```typescript
// GDPR compliance
const complianceConfig = {
  dataRetention: "7 years",
  dataExport: true,
  dataDeletion: true,
  auditLogging: true
}

// SOC 2 compliance
const securityConfig = {
  encryptionAtRest: true,
  encryptionInTransit: true,
  accessLogging: true,
  regularBackups: true
}
```

## 🚀 Scaling Considerations

### Horizontal Scaling

```bash
# Deploy multiple LibreChat instances
docker run -d --name librechat-1 -p 3080:3080 librechat
docker run -d --name librechat-2 -p 3081:3080 librechat
docker run -d --name librechat-3 -p 3082:3080 librechat

# Load balancer configuration
upstream librechat_backend {
  server localhost:3080;
  server localhost:3081;
  server localhost:3082;
}
```

### Database Optimization

```sql
-- Partition usage_metrics by organization
CREATE TABLE usage_metrics_partitioned (
  LIKE usage_metrics INCLUDING ALL
) PARTITION BY HASH (organization_id);

-- Create partitions for each organization
CREATE TABLE usage_metrics_org_1 PARTITION OF usage_metrics_partitioned
FOR VALUES WITH (modulus 10, remainder 0);
```

## 📈 Growth Metrics

### Key Performance Indicators

```typescript
const kpis = {
  monthlyRecurringRevenue: 45000,
  averageRevenuePerClient: 450,
  clientRetentionRate: 0.95,
  customerLifetimeValue: 5400,
  churnRate: 0.05
}
```

### Client Success Metrics

```typescript
const successMetrics = {
  timeToFirstValue: "2 hours",
  featureAdoptionRate: 0.78,
  supportTicketVolume: 12,
  clientSatisfactionScore: 4.8
}
```

## 🎉 Client Onboarding Checklist

### Pre-Launch
- [ ] Database migration completed
- [ ] LibreChat instance deployed
- [ ] Environment variables configured
- [ ] SSL certificates installed

### Client Setup
- [ ] Organization created in database
- [ ] Admin user account created
- [ ] LibreChat configuration applied
- [ ] MCP servers configured
- [ ] Knowledge bases created
- [ ] Team members invited

### Post-Launch
- [ ] Client training session scheduled
- [ ] Support documentation provided
- [ ] Usage monitoring enabled
- [ ] Feedback collection started

## 📞 Support & Resources

### Client Support
- **Email**: support@scalewize.ai
- **Slack**: #client-support
- **Documentation**: https://docs.scalewize.ai
- **Video Tutorials**: https://tutorials.scalewize.ai

### Technical Resources
- **API Documentation**: https://api.scalewize.ai
- **SDK Downloads**: https://github.com/scalewizeai/sdk
- **Status Page**: https://status.scalewize.ai

This onboarding process ensures each client gets a fully configured, secure, and scalable AI platform tailored to their specific needs and business requirements. 