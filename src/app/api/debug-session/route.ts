import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    // Get the session from cookies
    const cookieStore = request.cookies
    const authToken = cookieStore.get('sb-mtybaactacapokejmtxy-auth-token')
    
    console.log('Auth token present:', !!authToken)
    
    if (!authToken) {
      return NextResponse.json({
        success: false,
        error: 'No authentication token found',
        message: 'User is not logged in'
      })
    }

    // Initialize Supabase client to decode the session
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Try to get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.json({
        success: false,
        error: 'Session error',
        details: sessionError.message
      })
    }

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'No active session',
        message: 'User session not found'
      })
    }

    const userId = session.user.id
    console.log('Session user ID:', userId)

    // Now try to fetch the profile with the session user ID
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

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    console.log('Profile query result:', { profileData, profileError })

    return NextResponse.json({
      success: true,
      session: {
        userId: session.user.id,
        email: session.user.email,
        emailConfirmed: session.user.email_confirmed_at,
        lastSignIn: session.user.last_sign_in_at
      },
      profile: profileData,
      profileError: profileError ? {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details
      } : null
    })

  } catch (error) {
    console.error('Debug session error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}
