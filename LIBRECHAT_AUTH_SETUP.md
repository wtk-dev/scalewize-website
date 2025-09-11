# LibreChat Authentication & Multi-Tenancy Setup

This document explains how authentication works between Henly AI and LibreChat, enabling secure multi-tenant access with organization-specific configurations.

## 🔐 Authentication Architecture

### Overview
Henly AI uses a **JWT-based authentication system** to seamlessly integrate with LibreChat while maintaining multi-tenant isolation. Each user gets their own authenticated session in LibreChat with organization-specific configurations.

### Flow Diagram
```
User Login → Supabase Auth → JWT Token Generation → LibreChat iframe → Authenticated Chat
     ↓              ↓                ↓                    ↓                    ↓
  Dashboard    User Profile    Organization Config    Token Validation    Chat Interface
```

## 🏗️ Multi-Tenancy Design

### Organization Isolation
- **Database Level**: Row Level Security (RLS) policies ensure data isolation
- **Application Level**: Organization-specific configurations and limits
- **LibreChat Level**: JWT tokens contain organization context

### User Management
- Users belong to organizations with specific roles (user, admin, super_admin)
- Each organization has its own:
  - Chat sessions and history
  - Usage limits and billing
  - LibreChat configuration
  - MCP (Model Context Protocol) access
  - Knowledge bases

## 🔧 Implementation Details

### 1. JWT Token Structure
```typescript
interface LibreChatJWT {
  sub: string              // User ID
  email: string           // User email
  name: string            // Display name
  username: string        // Username
  avatar: string          // Avatar URL
  role: string            // User role
  organization: {
    id: string            // Organization ID
    name: string          // Organization name
    domain: string        // Organization domain
    plan_type: string     // Subscription plan
    librechat_config: any // Organization-specific config
  }
  iat: number             // Issued at
  exp: number             // Expires at
}
```

### 2. Authentication Flow

#### Step 1: User Login
```typescript
// User logs in via Supabase Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@company.com',
  password: 'password'
})
```

#### Step 2: Token Generation
```typescript
// Generate LibreChat JWT token
const token = await libreChatAuth.generateLibreChatToken(userId)
```

#### Step 3: iframe Integration
```typescript
// Load LibreChat with authentication
const libreChatUrl = `${LIBRECHAT_URL}?token=${token}&org=${organization.domain}`
```

### 3. API Endpoints

#### GET `/api/librechat/auth`
Returns the authenticated LibreChat URL for the current user.

**Response:**
```json
{
  "url": "http://localhost:3080?token=eyJ...&org=company-domain",
  "organization": {
    "id": "org-uuid",
    "name": "Company Name",
    "domain": "company-domain",
    "plan_type": "professional"
  }
}
```

#### POST `/api/librechat/auth`
Returns the JWT token and user information for direct LibreChat integration.

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "user@company.com",
    "name": "John Doe",
    "username": "john",
    "avatar": "https://ui-avatars.com/api/?name=John%20Doe&background=0D9488&color=fff",
    "role": "admin",
    "organization": {
      "id": "org-uuid",
      "name": "Company Name",
      "domain": "company-domain",
      "plan_type": "professional",
      "librechat_config": {
        "enabled_models": ["gpt-4", "claude-3"],
        "max_tokens": 100000,
        "knowledge_bases": ["company-docs", "sales-data"]
      }
    }
  }
}
```

## 🛠️ LibreChat Configuration

### Environment Variables
Add these to your LibreChat `.env` file:

```env
# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Enable JWT authentication
JWT_ACCESS_TOKEN_EXPIRY=24h
JWT_REFRESH_TOKEN_EXPIRY=7d

# Multi-tenant settings
ALLOW_REGISTRATION=false
ALLOW_SOCIAL_LOGIN=false
ENABLE_OAUTH=false

# Organization-based features
ENABLE_ORGANIZATIONS=true
ENABLE_KNOWLEDGE_BASES=true
ENABLE_MCP=true
```

### LibreChat Configuration Structure
```typescript
interface LibreChatConfig {
  enabled_models: string[]           // Available AI models
  max_tokens: number                 // Monthly token limit
  knowledge_bases: string[]          // Accessible knowledge bases
  mcp_servers: string[]              // Available MCP servers
  custom_instructions: string        // Organization-specific prompts
  allowed_endpoints: string[]        // API endpoints access
  features: {
    file_upload: boolean             // File upload capability
    image_generation: boolean        // Image generation access
    voice_chat: boolean              // Voice chat capability
    code_interpreter: boolean        // Code execution
  }
}
```

## 🔒 Security Considerations

### 1. Token Security
- JWT tokens expire after 24 hours
- Tokens are signed with a secure secret
- Organization context is embedded in tokens
- Tokens are transmitted over HTTPS

### 2. Data Isolation
- Row Level Security (RLS) policies in Supabase
- Organization-based database queries
- User role-based access control
- API endpoint protection

### 3. iframe Security
- Same-origin policy compliance
- Secure token transmission
- XSS protection through proper encoding
- CSP headers for additional security

## 📊 Usage Tracking

### Chat Sessions
```sql
-- Track LibreChat sessions
INSERT INTO chat_sessions (
  user_id,
  organization_id,
  librechat_session_id,
  model_used,
  session_metadata
) VALUES (
  'user-uuid',
  'org-uuid',
  'librechat-session-id',
  'gpt-4',
  '{"messages": 10, "tokens": 500}'
);
```

### Usage Metrics
```sql
-- Track token usage
INSERT INTO usage_metrics (
  organization_id,
  user_id,
  date,
  tokens_used,
  cost_usd,
  message_count
) VALUES (
  'org-uuid',
  'user-uuid',
  CURRENT_DATE,
  1000,
  0.02,
  5
);
```

## 🚀 Deployment Considerations

### Production Setup

1. **LibreChat Deployment**
   ```bash
   # Deploy LibreChat with proper environment variables
   docker run -d \
     --name librechat \
     -p 3080:3080 \
     -e JWT_SECRET=your-production-secret \
     -e JWT_REFRESH_SECRET=your-production-refresh-secret \
     -e ALLOW_REGISTRATION=false \
     -e ENABLE_ORGANIZATIONS=true \
     ghcr.io/danny-avila/librechat:latest
   ```

2. **Environment Variables**
   ```env
   # Henly AI
   LIBRECHAT_JWT_SECRET=your-production-jwt-secret
   NEXT_PUBLIC_LIBRECHAT_URL=https://your-librechat-domain.com
   
   # LibreChat
   JWT_SECRET=your-production-jwt-secret
   JWT_REFRESH_SECRET=your-production-refresh-secret
   ```

3. **SSL/TLS Configuration**
   - Enable HTTPS for both applications
   - Configure proper CORS headers
   - Set up secure cookie policies

### Scaling Considerations

1. **Load Balancing**
   - Deploy multiple LibreChat instances
   - Use sticky sessions for chat continuity
   - Implement proper health checks

2. **Database Optimization**
   - Index organization-based queries
   - Implement connection pooling
   - Monitor query performance

3. **Caching Strategy**
   - Cache organization configurations
   - Implement token caching
   - Use Redis for session storage

## 🔧 Troubleshooting

### Common Issues

1. **Token Expiration**
   ```typescript
   // Check token validity
   const payload = libreChatAuth.verifyToken(token)
   if (!payload) {
     // Token expired, regenerate
     const newToken = await libreChatAuth.generateLibreChatToken(userId)
   }
   ```

2. **Organization Access**
   ```typescript
   // Verify organization access
   const { data: profile } = await supabase
     .from('profiles')
     .select('organization_id')
     .eq('id', userId)
     .single()
   ```

3. **LibreChat Connection**
   ```typescript
   // Test LibreChat connectivity
   const response = await fetch(`${LIBRECHAT_URL}/api/auth/verify`, {
     headers: { Authorization: `Bearer ${token}` }
   })
   ```

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=true
LIBRECHAT_DEBUG=true
```

## 📚 Additional Resources

- [LibreChat Documentation](https://docs.librechat.ai/)
- [JWT Authentication Guide](https://jwt.io/introduction)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🤝 Support

For questions or issues with the authentication setup:
- Check the troubleshooting section above
- Review LibreChat logs for errors
- Verify environment variable configuration
- Test token generation and validation 