# ScaleWize AI - Multi-Tenant ChatBot Platform

A B2B SaaS platform that provides custom AI automation solutions to businesses. Built with Next.js 13+, Supabase, and LibreChat integration.

## Features

- 🔐 **Multi-Tenant Authentication** - Secure organization-based user isolation
- 🤖 **LibreChat Integration** - Custom AI chatbots for each organization
- 📊 **Usage Analytics** - Track usage, costs, and performance
- 🔧 **Custom Integrations** - Connect to internal tools via n8n workflows
- 💳 **Stripe Billing** - Usage-based billing and subscription management
- 👥 **Team Management** - User roles and permissions
- 🛡️ **Enterprise Security** - Row-level security and data isolation

## Tech Stack

- **Frontend**: Next.js 13+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **AI**: LibreChat integration
- **Payments**: Stripe
- **Automation**: n8n workflows
- **Deployment**: Vercel (recommended)

## Quick Start

### Prerequisites

- Node.js 18+ 
- Supabase account and project
- LibreChat instance (optional for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/scalewizeai/scalewize-website.git
   cd scalewize-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_LIBRECHAT_URL=https://localhost:3080
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

The application requires a Supabase database with the following tables:

- `organizations` - Client companies with subscription info
- `profiles` - User accounts linked to organizations  
- `chat_sessions` - LibreChat session tracking
- `usage_metrics` - Token usage and billing data
- `billing_records` - Stripe transaction history
- `api_keys` - Client API key management

See the database schema in `src/types/database.ts` for complete table definitions.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Client dashboard
│   ├── admin/            # Admin panel
│   ├── login/            # Authentication
│   └── signup/           # User registration
├── components/           # Reusable UI components
├── contexts/            # React contexts (Auth, etc.)
├── lib/                 # Utility libraries
├── types/               # TypeScript type definitions
└── middleware.ts        # Route protection
```

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Next.js 13+ setup with TypeScript
- [x] Supabase integration and authentication
- [x] Multi-tenant database schema
- [x] Basic dashboard layout

### Phase 2: Core Features 🚧
- [ ] LibreChat iframe integration
- [ ] Usage tracking and analytics
- [ ] Team management interface
- [ ] Settings and configuration

### Phase 3: Advanced Features 📋
- [ ] Stripe billing integration
- [ ] Admin dashboard
- [ ] API key management
- [ ] Real-time notifications

### Phase 4: Enterprise Features 📋
- [ ] Advanced analytics
- [ ] Custom integrations
- [ ] White-label options
- [ ] Performance optimization

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@scalewize.ai or join our Slack community.
# Updated repository structure - SWAI directory removed
