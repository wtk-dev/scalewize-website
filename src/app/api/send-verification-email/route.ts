import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
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
    const { email, userId } = await request.json()
    
    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email and user ID are required' },
        { status: 400 }
      )
    }

    // Get user profile and organization details
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        organizations!profiles_organization_id_fkey (
          id,
          name
        )
      `)
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Profile not found:', profileError)
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const organization = (profile as any).organizations
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Generate verification token
    const verificationToken = crypto.randomUUID()
    
    // Store verification token in database (you might want to create a separate table for this)
    // For now, we'll use the user's ID as the token in the URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/verify-email?token=${userId}&email=${encodeURIComponent(email)}`

    // Send verification email using n8n workflow
    const emailResult = await sendVerificationEmail({
      to: email,
      verificationUrl,
      fullName: profile.full_name || 'User',
      organizationName: organization.name
    })

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send verification email: ' + emailResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      messageId: emailResult.messageId
    })

  } catch (error) {
    console.error('Error sending verification email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
