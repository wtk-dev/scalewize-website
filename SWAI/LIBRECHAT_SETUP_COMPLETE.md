# Complete LibreChat Setup for ScaleWize AI

This guide provides step-by-step instructions for setting up LibreChat integration with ScaleWize AI, from local development to production deployment.

## 🎯 Overview

We're setting up a multi-tenant LibreChat instance that integrates with your ScaleWize AI platform, providing:
- JWT-based authentication
- Organization-specific configurations
- MCP server integration
- Knowledge base support
- Usage tracking and analytics

## 📁 Project Structure

```
SWAI/
├── scalewize-website/          # Your main Next.js app
│   ├── src/lib/librechat-auth.ts
│   ├── src/app/dashboard/chatbot/
│   └── .env.local
├── scalewize-chatbot/          # LibreChat instance
│   ├── .env
│   ├── librechat.yaml
│   ├── setup-scalewize.sh
│   ├── DEPLOYMENT_GUIDE.md
│   └── vercel.json
└── LIBRECHAT_SETUP_COMPLETE.md # This file
```

## 🚀 Quick Start (Local Development)

### Step 1: Configure LibreChat

1. **Navigate to LibreChat directory:**
   ```bash
   cd SWAI/scalewize-chatbot
   ```

2. **Update environment variables:**
   ```bash
   # Edit .env file
   nano .env
   ```

   **Required variables:**
   ```env
   # JWT Configuration (must match ScaleWize AI)
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
   
   # AI Model API Keys
   OPENAI_API_KEY=your-openai-api-key-here
   ANTHROPIC_API_KEY=your-anthropic-api-key-here
   
   # Database Configuration
   MONGO_URI=mongodb://mongodb:27017/LibreChat
   MEILI_MASTER_KEY=your-meili-master-key-here
   
   # CORS for local development
   CORS_ORIGINS=http://localhost:3000,http://localhost:3080
   ```

3. **Update LibreChat configuration:**
   ```bash
   # Edit librechat.yaml
   nano librechat.yaml
   ```

   **Key settings:**
   ```yaml
   # Enable multi-tenant features
   organizations:
     enabled: true
     defaultPlan: "starter"
   
   # Enable JWT authentication
   jwt:
     enabled: true
     secret: "${JWT_SECRET}"
     refreshSecret: "${JWT_REFRESH_SECRET}"
   
   # Disable default registration
   registration:
     enabled: false
   ```

### Step 2: Start LibreChat Services

1. **Run the setup script:**
   ```bash
   ./setup-scalewize.sh
   ```

   This script will:
   - Check Docker installation
   - Validate environment configuration
   - Create necessary directories
   - Start all services (MongoDB, Meilisearch, LibreChat)
   - Wait for services to be ready
   - Run basic health checks

2. **Verify services are running:**
   ```bash
   # Check LibreChat API
   curl http://localhost:3080/api/health
   
   # Check MongoDB
   docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
   
   # Check Meilisearch
   curl http://localhost:7700/health
   ```

### Step 3: Configure ScaleWize AI

1. **Navigate to ScaleWize AI directory:**
   ```bash
   cd ../scalewize-website
   ```

2. **Update environment variables:**
   ```bash
   # Edit .env.local
   nano .env.local
   ```

   **Add LibreChat configuration:**
   ```env
   # LibreChat Configuration
   NEXT_PUBLIC_LIBRECHAT_URL=http://localhost:3080
   LIBRECHAT_JWT_SECRET=your-super-secret-jwt-key-here
   LIBRECHAT_JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
   ```

3. **Start ScaleWize AI:**
   ```bash
   npm run dev
   ```

### Step 4: Test Integration

1. **Visit the chatbot dashboard:**
   - Open: http://localhost:3000/dashboard/chatbot
   - You should see the LibreChat iframe loading

2. **Test authentication:**
   - Login to ScaleWize AI
   - Navigate to the chatbot page
   - Verify JWT token is generated and passed to LibreChat

3. **Test chat functionality:**
   - Send a test message
   - Verify AI responses
   - Check usage tracking in Supabase

## 🌐 Production Deployment

### Option 1: Vercel Deployment (Recommended)

1. **Prepare LibreChat for Vercel:**
   ```bash
   cd SWAI/scalewize-chatbot
   
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   ```

2. **Deploy LibreChat:**
   ```bash
   # Deploy to Vercel
   vercel --prod
   
   # Note the deployment URL (e.g., https://your-librechat.vercel.app)
   ```

3. **Configure environment variables in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from your `.env` file
   - **Important:** Update `CORS_ORIGINS` to include your production domain

4. **Update ScaleWize AI configuration:**
   ```env
   # In scalewize-website/.env.local
   NEXT_PUBLIC_LIBRECHAT_URL=https://your-librechat.vercel.app
   ```

5. **Deploy ScaleWize AI:**
   ```bash
   cd ../scalewize-website
   vercel --prod
   ```

### Option 2: Railway Deployment

1. **Deploy LibreChat to Railway:**
   ```bash
   cd SWAI/scalewize-chatbot
   
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Configure environment variables in Railway:**
   - Go to Railway Dashboard → Your Project → Variables
   - Add all required environment variables

3. **Update ScaleWize AI with Railway URL:**
   ```env
   NEXT_PUBLIC_LIBRECHAT_URL=https://your-librechat.railway.app
   ```

### Option 3: Docker Deployment

1. **Build and deploy with Docker:**
   ```bash
   cd SWAI/scalewize-chatbot
   
   # Build production image
   docker build -t scalewize-librechat .
   
   # Run with production compose
   docker-compose -f deploy-compose.yml up -d
   ```

2. **Configure reverse proxy (nginx):**
   ```nginx
   server {
     listen 80;
     server_name chat.yourdomain.com;
     
     location / {
       proxy_pass http://localhost:3080;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   ```

## 🔧 Configuration Details

### JWT Authentication Setup

1. **Generate secure secrets:**
   ```bash
   # Generate JWT secret
   openssl rand -base64 32
   
   # Generate refresh secret
   openssl rand -base64 32
   ```

2. **JWT token structure:**
   ```json
   {
     "sub": "user-id",
     "email": "user@company.com",
     "organization": {
       "id": "org-id",
       "name": "Company Name",
       "domain": "company-domain",
       "plan_type": "professional"
     },
     "iat": 1234567890,
     "exp": 1234654290
   }
   ```

### Multi-Tenant Configuration

1. **Organization plans in LibreChat:**
   ```yaml
   # In librechat.yaml
   organizations:
     enabled: true
     defaultPlan: "starter"
     plans:
       starter:
         maxTokens: 10000
         models: ["gpt-3.5-turbo"]
         features:
           fileUpload: true
           codeInterpreter: false
       professional:
         maxTokens: 100000
         models: ["gpt-4", "claude-3-sonnet"]
         features:
           fileUpload: true
           codeInterpreter: true
       enterprise:
         maxTokens: 1000000
         models: ["gpt-4-turbo", "claude-3-opus"]
         features:
           fileUpload: true
           codeInterpreter: true
           voiceChat: true
   ```

2. **MCP servers per organization:**
   ```typescript
   // In ScaleWize AI - src/lib/organization-config.ts
   const mcpServers = {
     "acme-corp": [
       {
         name: "Acme CRM",
         endpoint: "https://acme-crm.internal/api/mcp",
         capabilities: ["read_customers", "update_leads"]
       }
     ]
   }
   ```

### Knowledge Base Setup

1. **Enable vector search in LibreChat:**
   ```yaml
   # In librechat.yaml
   knowledgeBases:
     enabled: true
     vectorDimensions: 1536
     embeddingModel: "text-embedding-ada-002"
   ```

2. **Add knowledge bases in Supabase:**
   ```sql
   -- Create knowledge base for organization
   INSERT INTO knowledge_bases (name, organization_id, type)
   VALUES ('Company Documentation', 'org-id', 'documentation');
   
   -- Add documents to knowledge base
   INSERT INTO knowledge_base_documents (
     knowledge_base_id, 
     title, 
     content, 
     file_type
   ) VALUES (
     'kb-id',
     'Company Policy',
     'This is the company policy document...',
     'text/plain'
   );
   ```

## 🔒 Security Configuration

### CORS Setup

1. **Development:**
   ```env
   CORS_ORIGINS=http://localhost:3000,http://localhost:3080
   ```

2. **Production:**
   ```env
   CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
   ```

### Rate Limiting

1. **Configure rate limits:**
   ```yaml
   # In librechat.yaml
   rateLimits:
     requests:
       windowMs: 900000  # 15 minutes
       max: 100          # limit each IP to 100 requests per windowMs
     fileUploads:
       windowMs: 3600000 # 1 hour
       max: 50           # limit each user to 50 uploads per hour
   ```

### Environment Variables Security

1. **Never commit secrets to Git:**
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   echo ".env.local" >> .gitignore
   ```

2. **Use different secrets for each environment:**
   ```env
   # Development
   JWT_SECRET=dev-secret-key
   
   # Production
   JWT_SECRET=prod-secret-key
   ```

## 📊 Monitoring and Analytics

### Health Checks

1. **API Health:**
   ```bash
   curl https://your-librechat-domain.com/api/health
   ```

2. **Database Health:**
   ```bash
   # MongoDB
   docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
   
   # PostgreSQL (for RAG)
   docker-compose exec vectordb pg_isready
   ```

### Usage Tracking

1. **Enable usage tracking:**
   ```env
   ENABLE_USAGE_TRACKING=true
   USAGE_DATABASE_URL=your-supabase-project-url
   ```

2. **Monitor usage in Supabase:**
   ```sql
   -- Check usage by organization
   SELECT 
     organization_id,
     SUM(tokens_used) as total_tokens,
     COUNT(*) as message_count
   FROM usage_metrics 
   WHERE date >= CURRENT_DATE - INTERVAL '30 days'
   GROUP BY organization_id;
   ```

### Logging

1. **View logs:**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f api
   ```

2. **Log levels:**
   ```env
   LOG_LEVEL=info  # debug, info, warn, error
   ```

## 🔧 Troubleshooting

### Common Issues

1. **JWT Authentication Fails:**
   ```bash
   # Check JWT secret matches between services
   echo $JWT_SECRET
   echo $LIBRECHAT_JWT_SECRET
   ```

2. **CORS Issues:**
   ```bash
   # Check CORS configuration
   curl -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: X-Requested-With" \
        -X OPTIONS http://localhost:3080/api/health
   ```

3. **Database Connection Issues:**
   ```bash
   # Check MongoDB
   docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
   
   # Check PostgreSQL
   docker-compose exec vectordb pg_isready -U myuser -d mydatabase
   ```

4. **LibreChat not loading in iframe:**
   - Check browser console for errors
   - Verify CORS configuration
   - Check JWT token generation
   - Verify LibreChat URL is correct

### Performance Issues

1. **Slow response times:**
   ```bash
   # Check container resource usage
   docker stats
   
   # Check disk usage
   docker system df
   ```

2. **High memory usage:**
   ```bash
   # Monitor memory usage
   docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
   ```

## 🚀 Next Steps

### Immediate Actions

1. **Complete local setup:**
   - [ ] Configure environment variables
   - [ ] Start LibreChat services
   - [ ] Test integration with ScaleWize AI
   - [ ] Verify JWT authentication

2. **Production deployment:**
   - [ ] Deploy LibreChat to Vercel/Railway
   - [ ] Configure production environment
   - [ ] Update ScaleWize AI configuration
   - [ ] Test production integration

### Advanced Features

1. **MCP Server Integration:**
   - [ ] Set up organization-specific MCP servers
   - [ ] Configure CRM integrations
   - [ ] Add custom tools and capabilities

2. **Knowledge Base Setup:**
   - [ ] Upload organization documents
   - [ ] Configure vector search
   - [ ] Test document retrieval

3. **Analytics and Monitoring:**
   - [ ] Set up usage tracking
   - [ ] Configure alerts
   - [ ] Monitor performance metrics

### Scaling Preparation

1. **Load Balancing:**
   - [ ] Deploy multiple LibreChat instances
   - [ ] Configure load balancer
   - [ ] Set up session stickyness

2. **Database Scaling:**
   - [ ] Set up MongoDB replica set
   - [ ] Configure PostgreSQL clustering
   - [ ] Implement backup strategies

## 📚 Additional Resources

- [LibreChat Documentation](https://docs.librechat.ai/)
- [ScaleWize AI Integration Guide](./scalewize-website/LIBRECHAT_SCALING_STRATEGY.md)
- [Deployment Guide](./scalewize-chatbot/DEPLOYMENT_GUIDE.md)
- [JWT Authentication Guide](https://jwt.io/introduction)

## 🆘 Support

For issues and questions:
- Check the troubleshooting section above
- Review LibreChat logs: `docker-compose logs -f`
- Check ScaleWize AI integration logs
- Open an issue in the GitHub repository

---

**🎉 Congratulations!** You now have a complete LibreChat integration with ScaleWize AI. The setup provides a solid foundation for multi-tenant AI chatbot services with enterprise-grade security and scalability. 