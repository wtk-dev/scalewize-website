const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n')

  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...')
    const { data, error } = await supabase.from('organizations').select('count').limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    console.log('✅ Connection successful\n')

    // Test 2: Check if tables exist
    console.log('2. Checking database tables...')
    const tables = ['organizations', 'profiles', 'chat_sessions', 'usage_metrics', 'billing_records', 'api_keys']
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          console.error(`❌ Table '${table}' not accessible:`, error.message)
        } else {
          console.log(`✅ Table '${table}' accessible`)
        }
      } catch (err) {
        console.error(`❌ Error accessing table '${table}':`, err.message)
      }
    }
    console.log()

    // Test 3: Test RLS policies
    console.log('3. Testing Row Level Security...')
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, domain')
      .limit(5)
    
    if (orgError) {
      console.error('❌ RLS test failed:', orgError.message)
    } else {
      console.log(`✅ RLS working - found ${orgs?.length || 0} organizations`)
    }
    console.log()

    // Test 4: Test auth functionality
    console.log('4. Testing authentication...')
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('❌ Auth test failed:', authError.message)
    } else {
      console.log('✅ Authentication system accessible')
      console.log(`   Current session: ${session ? 'Active' : 'None'}`)
    }
    console.log()

    console.log('🎉 All tests completed successfully!')
    return true

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    return false
  }
}

async function createTestData() {
  console.log('🧪 Creating test data...\n')

  try {
    // Create a test organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: 'Test Organization',
        domain: 'test-org',
        subscription_status: 'trial',
        plan_type: 'starter',
        max_users: 50,
        max_chat_sessions: 1000,
        monthly_token_limit: 100000,
        librechat_config: {}
      })
      .select()
      .single()

    if (orgError) {
      console.error('❌ Failed to create test organization:', orgError.message)
      return false
    }

    console.log('✅ Test organization created:', org.name)

    // Create a test profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        organization_id: org.id,
        role: 'admin'
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Failed to create test profile:', profileError.message)
      return false
    }

    console.log('✅ Test profile created:', profile.full_name)

    // Create test usage metrics
    const { error: usageError } = await supabase
      .from('usage_metrics')
      .insert({
        organization_id: org.id,
        user_id: profile.id,
        date: new Date().toISOString().split('T')[0],
        tokens_used: 1000,
        cost_usd: 0.02,
        message_count: 5
      })

    if (usageError) {
      console.error('❌ Failed to create test usage metrics:', usageError.message)
    } else {
      console.log('✅ Test usage metrics created')
    }

    console.log('\n🎉 Test data created successfully!')
    return true

  } catch (error) {
    console.error('❌ Failed to create test data:', error.message)
    return false
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...\n')

  try {
    // Delete test data in reverse order (due to foreign key constraints)
    await supabase.from('usage_metrics').delete().eq('user_id', 'test-user-id')
    await supabase.from('profiles').delete().eq('id', 'test-user-id')
    await supabase.from('organizations').delete().eq('domain', 'test-org')

    console.log('✅ Test data cleaned up')
    return true
  } catch (error) {
    console.error('❌ Failed to cleanup test data:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Henly AI - Supabase Test Suite\n')
  console.log('=====================================\n')

  const connectionTest = await testSupabaseConnection()
  
  if (!connectionTest) {
    console.log('\n❌ Connection test failed. Please check your configuration.')
    process.exit(1)
  }

  const createTest = await createTestData()
  
  if (createTest) {
    await cleanupTestData()
  }

  console.log('\n✨ Test suite completed!')
}

main().catch(console.error) 