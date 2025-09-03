# ScaleWize AI - Multi-Tenant ChatBot Platform

## Project Overview

This is a Next.js 15 application with Supabase backend that provides a multi-tenant chatbot platform. The system allows organizations to create accounts, manage team members, and access various AI-powered features.

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4
- **Authentication**: Supabase Auth with custom context
- **State Management**: React Context API

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Row Level Security**: RLS policies for data isolation
- **API Routes**: Next.js API routes for server-side operations

## 🔐 Authentication & Authorization System

### User Roles
- **Admin**: Can manage organization settings, invite users, access all features
- **Member**: Can access organization features but cannot manage settings
- **Super Admin**: Extended admin privileges (future use)

### Multi-Tenant Data Isolation
- Each organization has isolated data
- RLS policies ensure users can only access their organization's data
- Cross-organization data access is prevented

## 📊 Database Schema

### Core Tables
1. **organizations**: Organization details and limits
2. **profiles**: User profiles with role and organization association
3. **organization_invitations**: Pending invitations for new members
4. **organization_members**: Organization membership tracking

### Key Relationships
- Users belong to one organization
- Organizations can have multiple users
- Invitations link to organizations and invited users

## 🚀 Key Features Implemented

### 1. Organization Signup System
- **Endpoint**: `/api/signup-direct`
- **Functionality**: Creates user account, organization, and admin profile
- **Security**: Uses Supabase service role key for reliable creation
- **Auto-confirmation**: Email is auto-confirmed for immediate access

### 2. Invitation System
- **Endpoint**: `/api/invite-admin`
- **Functionality**: Allows admins to invite new team members
- **Security**: Validates admin permissions using service role
- **Magic Links**: Generates secure tokens for invitation acceptance

### 3. Dashboard & Settings
- **Organization Management**: View and manage organization details
- **User Invitations**: Send and manage team member invitations
- **Role-based Access**: Only admins can access settings

### 4. Authentication Context
- **Global State**: Manages user session and profile data
- **Auto-refresh**: Handles token refresh automatically
- **Organization Data**: Provides organization context throughout app

## 🔧 Technical Implementation Details

### API Routes

#### `/api/signup-direct`
- Creates user account using Supabase admin API
- Creates organization with default limits
- Creates admin profile for the first user
- Bypasses RLS using service role key

#### `/api/invite-admin`
- Validates admin permissions
- Creates invitation records
- Generates secure tokens
- Prevents duplicate invitations

#### `/api/debug-auth`
- Diagnostic endpoint for authentication issues
- Checks environment variables
- Validates service role key

### Security Features

#### Row Level Security (RLS)
```sql
-- Organizations: Users can only access their own organization
CREATE POLICY "Users can view own organization" ON organizations
FOR SELECT USING (id = auth.jwt() ->> 'organization_id');

-- Profiles: Users can only access profiles in their organization
CREATE POLICY "Users can view own organization profiles" ON profiles
FOR SELECT USING (organization_id = auth.jwt() ->> 'organization_id');
```

#### Service Role Usage
- Used for admin operations that bypass RLS
- Organization and profile creation during signup
- Invitation management
- User permission validation

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🎯 User Flow

### 1. Organization Creation
1. User visits `/signup`
2. Fills out organization and user details
3. System creates account, organization, and admin profile
4. User is redirected to dashboard

### 2. Team Member Invitation
1. Admin goes to Settings page
2. Enters email address of new team member
3. System creates invitation with secure token
4. Invitation link is generated (email sending to be implemented)

### 3. Invitation Acceptance
1. User clicks invitation link
2. System validates token and expiration
3. User creates account or logs in
4. User is automatically added to organization

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Supabase account
- Git

### Installation
```bash
# Clone repository
git clone <repository-url>
cd scalewize-website

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
# Execute SQL scripts in scripts/ directory

# Start development server
npm run dev
```

### Database Setup
1. Create Supabase project
2. Run SQL migrations from `scripts/` directory
3. Set up RLS policies
4. Configure authentication settings

## 🔍 Troubleshooting

### Common Issues

#### 1. Authentication Errors
- **Symptom**: 401 Unauthorized errors
- **Solution**: Check service role key and environment variables
- **Debug**: Use `/api/debug-auth` endpoint

#### 2. RLS Policy Issues
- **Symptom**: Permission denied errors
- **Solution**: Verify RLS policies are correctly applied
- **Debug**: Check database logs in Supabase dashboard

#### 3. Cookie Issues (Next.js 15)
- **Symptom**: Auth session missing
- **Solution**: Ensure `await cookies()` is used in API routes
- **Fix**: Use service role key for admin operations

### Debug Endpoints
- `/api/debug-auth`: Check authentication state
- `/api/test-service-role`: Validate service role key
- `/api/debug-invite`: Debug invitation issues

## 🚧 Future Enhancements

### Planned Features
1. **Email Integration**: Send actual invitation emails
2. **Advanced Analytics**: Usage tracking and reporting
3. **Billing Integration**: Subscription management
4. **API Rate Limiting**: Enhanced rate limiting
5. **Audit Logging**: Track user actions
6. **Multi-factor Authentication**: Enhanced security

### Technical Improvements
1. **Error Handling**: More robust error handling
2. **Testing**: Unit and integration tests
3. **Performance**: Caching and optimization
4. **Monitoring**: Application monitoring and logging

## 📝 Notes

- The system uses Supabase service role key for admin operations to ensure reliability
- Email confirmation is auto-enabled for immediate access
- RLS policies provide data isolation between organizations
- The invitation system generates secure tokens with 7-day expiration
- All API routes include proper error handling and validation

## 🔗 Related Files

### Key Components
- `src/contexts/AuthContext.tsx`: Authentication state management
- `src/app/api/signup-direct/route.ts`: Organization signup
- `src/app/api/invite-admin/route.ts`: Team invitation system
- `src/app/dashboard/settings/page.tsx`: Admin settings interface

### Database Scripts
- `scripts/invitation-system.sql`: Invitation tables and policies
- `scripts/fix-signup-rls.sql`: RLS policy fixes

### Configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `next.config.js`: Next.js configuration
- `tsconfig.json`: TypeScript configuration
