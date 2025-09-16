import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { sendVerificationEmail } from '@/lib/email-service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, organizationName } = await request.json()
    
    console.log('Signup request:', { email, fullName, organizationName })
    
    // Create user first
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false // Require email verification in production
    })
    
    if (userError) {
      console.error('User creation error:', userError)
      return NextResponse.json(
        { error: 'Failed to create user: ' + userError.message },
        { status: 400 }
      )
    }
    
    const userId = userData.user.id
    console.log('User created successfully:', userId)
    console.log('User ID type:', typeof userId)
    console.log('User ID value:', userId)
    
    // Create organization (Supabase will handle slug and created_by automatically)
    const { data: orgData, error: orgError } = await (supabaseAdmin as any)
      .from('organizations')
      .insert({
        name: organizationName,
        // slug and created_by will be set automatically by the trigger
      })
      .select()
      .single()
    
    if (orgError) {
      console.error('Organization creation error:', orgError)
      // Clean up user if organization creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: 'Failed to create organization: ' + (orgError.message || 'Unknown error') },
        { status: 400 }
      )
    }
    
    console.log('Organization created successfully:', orgData)
    
    // Debug: Check what we're trying to insert
    const profileData = {
      id: userId,
      full_name: fullName,
      email,
      organization_id: orgData.id,
      role: 'admin',
      is_verified: process.env.NODE_ENV === 'production' ? false : true, // Require verification in production
      email_verification_required: process.env.NODE_ENV === 'production' ? true : false // Require verification in production
    }
    
    console.log('Attempting to create profile with data:', profileData)
    console.log('Profile ID type:', typeof profileData.id)
    console.log('Organization ID type:', typeof profileData.organization_id)
    
    // Create profile with proper error handling
    const { data: createdProfile, error: profileError } = await (supabaseAdmin as any)
      .from('profiles')
      .insert(profileData)
      .select()
      .single()
    
    if (profileError) {
      console.error('Profile creation error:', profileError)
      console.error('Profile creation details:', profileData)
      
      // Clean up user and organization if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId)
      await supabaseAdmin.from('organizations').delete().eq('id', orgData.id)
      
      return NextResponse.json(
        { error: 'Failed to create profile: ' + (profileError.message || 'Unknown error') },
        { status: 400 }
      )
    }
    
    console.log('Profile created successfully:', createdProfile)
    
    // Send verification email if in production or if email verification is required
    let emailSent = false
    if (process.env.NODE_ENV === 'production' || profileData.email_verification_required) {
      try {
        const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/verify-email?token=${userId}&email=${encodeURIComponent(email)}`
        
        const emailResult = await sendVerificationEmail({
          to: email,
          verificationUrl,
          fullName: fullName,
          organizationName: organizationName
        })

        if (emailResult.success) {
          emailSent = true
          console.log('Verification email sent successfully:', emailResult.messageId)
        } else {
          console.error('Failed to send verification email:', emailResult.error)
        }
      } catch (emailError) {
        console.error('Error sending verification email:', emailError)
        // Don't fail the signup if email fails
      }
    }
    
    // Generate a session for the newly created user
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email,
      password: password,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`
      }
    })

    if (sessionError) {
      console.error('Session generation error:', sessionError)
      // Don't fail the signup, just log the error
    }

    return NextResponse.json({
      message: 'User, organization, and profile created successfully',
      userId,
      organizationId: orgData.id,
      profileId: createdProfile.id,
      emailSent,
      session: sessionData?.properties ? {
        access_token: (sessionData.properties as any).access_token,
        refresh_token: (sessionData.properties as any).refresh_token
      } : null,
      redirectUrl: (sessionData?.properties as any)?.action_link || null
    })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}