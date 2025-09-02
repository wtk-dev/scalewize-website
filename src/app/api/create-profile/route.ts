import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const { userId, email, fullName, role = 'user' } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    // Initialize Supabase admin client to bypass RLS
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

    console.log('Creating profile for user:', { userId, email, fullName, role })

    // Create profile using service role (bypasses RLS)
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        full_name: fullName,
        role: role,
        is_active: true,
        is_verified: true,
        email_verification_required: false,
        organization_id: null // Will be set when user creates/joins an organization
      } as any)
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return NextResponse.json(
        { error: 'Failed to create profile', details: profileError },
        { status: 500 }
      )
    }

    console.log('Profile created successfully:', profileData)

    return NextResponse.json({
      profile: profileData,
      organization: null // No organization for new users
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}
