import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')
    
    if (!userId && !email) {
      return NextResponse.json(
        { error: 'Either userId or email is required' },
        { status: 400 }
      )
    }

    let profileData = null
    let profileError = null

    // Try to find profile by user ID first
    if (userId) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          organization_id,
          is_verified,
          email_verified_at,
          organizations!profiles_organization_id_fkey (
            id,
            name,
            slug
          )
        `)
        .eq('id', userId)
        .single()
      
      profileData = data
      profileError = error
    }

    // If not found by ID, try by email
    if ((profileError || !profileData) && email) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          organization_id,
          is_verified,
          email_verified_at,
          organizations!profiles_organization_id_fkey (
            id,
            name,
            slug
          )
        `)
        .eq('email', email)
        .single()
      
      profileData = data
      profileError = error
    }

    return NextResponse.json({
      success: true,
      profile: profileData,
      error: profileError,
      searchParams: { userId, email }
    })

  } catch (error) {
    console.error('Debug profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}