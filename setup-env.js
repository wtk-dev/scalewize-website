const fs = require('fs')
const path = require('path')

console.log('🔧 ScaleWize AI - Environment Setup\n')
console.log('===================================\n')

// Check if .env.local already exists
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!')
  console.log('Please update it with your Supabase credentials:\n')
} else {
  console.log('📝 Creating .env.local file...\n')
}

const envContent = `# Supabase Configuration
# Replace these with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# LibreChat Configuration
NEXT_PUBLIC_LIBRECHAT_URL=https://localhost:3080

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
`

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env.local created successfully!')
}

console.log('📋 Next Steps:')
console.log('1. Open .env.local in your editor')
console.log('2. Replace the placeholder values with your actual Supabase credentials:')
console.log('   - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL')
console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anon/public key')
console.log('   - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key')
console.log('\n3. Run the test script: npm run test:supabase')
console.log('4. Start the development server: npm run dev')
console.log('\n🔗 You can find these values in your Supabase project dashboard under Settings > API') 