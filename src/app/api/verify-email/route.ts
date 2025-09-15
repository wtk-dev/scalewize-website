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

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json()
    
    console.log('Server-side verification attempt:', { token, email })
    
    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      )
    }

    // Try to find profile by user ID first
    let profileData = null
    const { data: profileById, error: errorById } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        email,
        organization_id,
        organizations!profiles_organization_id_fkey (
          id,
          name,
          slug
        )
      `)
      .eq('id', token)
      .single()

    if (profileById && !errorById) {
      profileData = profileById
      console.log('Profile found by ID:', profileData)
    } else {
      console.log('Profile not found by ID, trying by email')
      
      // Try to find profile by email
      const { data: profileByEmail, error: errorByEmail } = await supabaseAdmin
        .from('profiles')
        .select(`
          id,
          email,
          organization_id,
          organizations!profiles_organization_id_fkey (
            id,
            name,
            slug
          )
        `)
        .eq('email', email)
        .single()

      if (profileByEmail && !errorByEmail) {
        profileData = profileByEmail
        console.log('Profile found by email:', profileData)
      } else {
        console.error('Profile not found by either ID or email:', { errorById, errorByEmail })
        
        // Try to create the profile
        console.log('Attempting to create profile for user ID:', token)
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(token)
        
        if (authUser?.user) {
          console.log('Auth user found, creating profile...')
          const { data: newProfile, error: createError } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: token,
              email: email,
              full_name: authUser.user.user_metadata?.full_name || 'User',
              organization_id: null,
              role: 'admin',
              is_verified: false
            })
            .select()
            .single()
          
          if (createError) {
            console.error('Failed to create profile:', createError)
            return NextResponse.json(
              { error: 'Profile not found and could not be created' },
              { status: 404 }
            )
          }
          
          profileData = newProfile
          console.log('Profile created successfully:', profileData)
        } else {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }
      }
    }

    // Verify email matches
    if (profileData.email !== email) {
      console.error('Email mismatch:', { profileEmail: profileData.email, providedEmail: email })
      return NextResponse.json(
        { error: 'Email verification failed' },
        { status: 400 }
      )
    }

    // Update profile verification status
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        is_verified: true,
        email_verified_at: new Date().toISOString()
      })
      .eq('id', profileData.id)

    if (updateError) {
      console.error('Error updating verification status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update verification status' },
        { status: 500 }
      )
    }

    // Update auth user email confirmation
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      profileData.id,
      {
        email_confirm: true
      }
    )

    if (authUpdateError) {
      console.error('Error updating auth user:', authUpdateError)
      // Don't fail the entire process
    } else {
      console.log('Auth user email confirmation updated successfully')
    }

    return NextResponse.json({
      success: true,
      profile: profileData,
      message: 'Email verified successfully'
    })

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
