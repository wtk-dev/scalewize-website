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

    // Validate invitation token and get organization details
    const { data: invitationData, error: invitationError } = await supabaseAdmin
      .from('invitations')
      .select(`
        id,
        email,
        role,
        status,
        expires_at,
        organization_id,
        organizations!invitations_organization_id_fkey (
          name
        )
      `)
      .eq('token', token)
      .single()

    if (invitationError || !invitationData) {
      console.error('Invitation not found:', invitationError)
      return NextResponse.json(
        { error: 'Invalid or expired invitation link' },
        { status: 404 }
      )
    }

    // Check if invitation is still pending
    if (invitationData.status !== 'pending') {
      return NextResponse.json(
        { error: 'This invitation has already been used or cancelled' },
        { status: 400 }
      )
    }

    // Check if invitation is expired
    if (new Date(invitationData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Check if the email matches the invitation
    if (invitationData.email !== email) {
      return NextResponse.json(
        { error: 'Email does not match the invitation' },
        { status: 400 }
      )
    }

    const organizationId = invitationData.organization_id
    const organizationName = (invitationData.organizations as any)?.name

    // Check if user already exists by checking profiles table
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()
    
    if (existingProfile) {
      return NextResponse.json(
        { error: 'A user with this email already exists. Please log in instead.' },
        { status: 409 }
      )
    }

    // Create user account with email already confirmed
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for invited users
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
    
    // Verify the user was actually created
    const { data: verifyUser, error: verifyUserError } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (verifyUserError || !verifyUser.user) {
      console.error('User verification failed:', verifyUserError)
      return NextResponse.json(
        { error: 'User was created but could not be verified: ' + (verifyUserError?.message || 'Unknown error') },
        { status: 500 }
      )
    }
    console.log('User verified in auth:', verifyUser.user.email)

    // Create user profile with organization assignment
    const profileData = {
      id: userId,
      full_name: fullName,
      email,
      organization_id: organizationId,
      role: invitationData.role, // Use the role from the invitation
      is_verified: true, // Auto-verify invited users
      email_verification_required: false, // No verification needed for invited users
      is_active: true,
      status: 'active',
      onboarding_step: 'completed',
      profile_completion_percentage: 100,
      invitation_accepted_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      invitation_status: 'accepted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Creating profile with data:', profileData)

    const { data: createdProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(profileData as any)
      .select()
      .single()

    if (profileError || !createdProfile) {
      console.error('Profile creation error:', profileError)
      console.error('Profile data that failed:', profileData)
      console.error('Full error details:', JSON.stringify(profileError, null, 2))
      
      // Clean up the created user if profile creation fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId)
        console.log('Cleaned up user after profile creation failure')
      } catch (cleanupError) {
        console.error('Failed to cleanup user:', cleanupError)
      }
      
      return NextResponse.json(
        { error: 'Failed to create user profile: ' + (profileError?.message || 'Unknown error') },
        { status: 500 }
      )
    }

    console.log('Profile created successfully:', (createdProfile as any).id)

    // Verify the profile was actually created by querying it back
    const { data: verifyProfile, error: verifyError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (verifyError || !verifyProfile) {
      console.error('Profile verification failed:', verifyError)
      return NextResponse.json(
        { error: 'Profile was created but could not be verified' },
        { status: 500 }
      )
    }

    console.log('Profile verified in database:', verifyProfile)

    // Update invitation status to 'accepted'
    const { error: updateInvitationError } = await supabaseAdmin
      .from('invitations')
      .update({ 
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationData.id)

    if (updateInvitationError) {
      console.error('Failed to update invitation status:', updateInvitationError)
      // Don't fail the entire process for this, just log the error
    } else {
      console.log('Invitation status updated to accepted')
    }

    // Don't generate magic link - let user log in manually after profile creation
    // This ensures the profile exists before the user tries to access the dashboard
    console.log('Profile creation completed successfully for user:', userId)

    return NextResponse.json({
      message: 'User account and profile created successfully. Please log in to continue.',
      userId,
      organizationId: organizationId,
      organizationName: organizationName,
      profileId: (createdProfile as any).id,
      redirectUrl: '/login',
      success: true
    })

  } catch (error) {
    console.error('Invitation signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
