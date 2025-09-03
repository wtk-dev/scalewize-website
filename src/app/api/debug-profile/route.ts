import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV
    }

    console.log('Environment check:', envCheck)

    // Initialize Supabase admin client
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Attempting to fetch profile for user:', userId)

    // Try to fetch profile with detailed error logging
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    console.log('Profile query result:', { profileData, profileError })

    if (profileError) {
      console.error('Profile fetch error details:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      })

      return NextResponse.json({
        success: false,
        error: 'Profile fetch failed',
        details: {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        },
        environment: envCheck,
        userId
      })
    }

    if (!profileData) {
      return NextResponse.json({
        success: false,
        error: 'Profile not found',
        environment: envCheck,
        userId
      })
    }

    // If profile has organization_id, fetch organization data
    let organizationData = null
    if ((profileData as any).organization_id) {
      const { data: orgData, error: orgError } = await supabaseAdmin
        .from('organizations')
        .select('*')
        .eq('id', (profileData as any).organization_id)
        .single()

      if (orgError) {
        console.error('Organization fetch error:', orgError)
      } else {
        organizationData = orgData
      }
    }

    return NextResponse.json({
      success: true,
      profile: profileData,
      organization: organizationData,
      environment: envCheck,
      userId
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: (error as Error).message,
        environment: {
          NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          NODE_ENV: process.env.NODE_ENV,
          VERCEL_ENV: process.env.VERCEL_ENV
        }
      },
      { status: 500 }
    )
  }
}
