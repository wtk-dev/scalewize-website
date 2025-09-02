import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const { token, fullName, password, email } = await request.json()

    // Validate input
    if (!token || !fullName || !password || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create admin client for user creation
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

    // TODO: Validate invitation token and get organization details
    // For now, we'll simulate this with mock data
    const mockInvitation = {
      id: 'mock-invite-id',
      organizationId: 'd22f61c4-58ce-4f2f-b9b8-d2878979e367', // This should come from actual invitation
      organizationName: 'Mock Organization',
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    }

    // Check if invitation is valid and not expired
    if (new Date(mockInvitation.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Check if user already exists by checking profiles table
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()
    
    if (existingProfile) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create user account
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: process.env.NODE_ENV === 'production' ? false : true, // Require email verification in production
      user_metadata: {
        full_name: fullName
      }
    })

    if (userError || !userData.user) {
      console.error('User creation error:', userError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    const userId = userData.user.id
    console.log('User created successfully:', userId)

    // Create user profile with organization assignment
    const profileData = {
      id: userId,
      full_name: fullName,
      email,
      organization_id: mockInvitation.organizationId,
      role: 'user', // Invited users get 'user' role by default
      is_verified: process.env.NODE_ENV === 'production' ? false : true, // Require verification in production
      email_verification_required: process.env.NODE_ENV === 'production' ? true : false // Require verification in production
    }

    const { data: createdProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(profileData as any)
      .select()
      .single()

    if (profileError || !createdProfile) {
      console.error('Profile creation error:', profileError)
      
      // Clean up the created user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId)
      
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    console.log('Profile created successfully:', (createdProfile as any).id)

    // TODO: Update invitation status to 'accepted'
    // This would involve updating the invitations table

    // Generate session for automatic login
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
      }
    })

    if (sessionError || !sessionData) {
      console.error('Session generation error:', sessionError)
      // Don't fail the entire process, user can still log in manually
    }

    return NextResponse.json({
      message: 'User account created successfully',
      userId,
      organizationId: mockInvitation.organizationId,
      profileId: (createdProfile as any).id,
      session: sessionData?.properties ? {
        access_token: (sessionData.properties as any).access_token,
        refresh_token: (sessionData.properties as any).refresh_token
      } : null,
      redirectUrl: (sessionData?.properties as any)?.action_link || null
    })

  } catch (error) {
    console.error('Invitation signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
