import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const { email, organizationId, userId } = await request.json()
    
    console.log('Creating invitation for:', { email, organizationId, userId })
    
    // Validate input
    if (!email || !organizationId || !userId) {
      return NextResponse.json(
        { error: 'Email, organization ID, and user ID are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create admin client using service role
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

    // Verify that the user is an admin of the organization
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('organization_id', organizationId)
      .in('role', ['admin', 'super_admin'])
      .single()

    if (profileError || !profile) {
      console.error('Admin check failed:', profileError)
      return NextResponse.json(
        { error: 'You must be an admin to invite users' },
        { status: 403 }
      )
    }

    console.log('Admin verification successful:', profile.role)

    // Check if user is already a member
    const { data: existingMember } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .eq('organization_id', organizationId)
      .single()

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this organization' },
        { status: 400 }
      )
    }

    // Check if invitation already exists and is pending
    const { data: existingInvitation } = await supabaseAdmin
      .from('invitations')
      .select('id')
      .eq('email', email)
      .eq('organization_id', organizationId)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation is already pending for this email' },
        { status: 400 }
      )
    }

    // Generate secure token
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Create invitation record in the invitations table using service role
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('invitations')
      .insert({
        organization_id: organizationId,
        email,
        invited_by: userId, // Set to the admin who sent the invitation
        token,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single()

    if (invitationError) {
      console.error('Invitation creation error:', invitationError)
      return NextResponse.json(
        { error: 'Failed to create invitation: ' + invitationError.message },
        { status: 500 }
      )
    }

    console.log('Invitation created successfully:', invitation.id)

    // Get organization details for email
    const { data: organization } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single()

    // Create invitation URL
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${token}`

    console.log('Invitation URL created:', inviteUrl)

    // Send invitation email using our email service
    try {
      const { sendInvitationEmail } = await import('@/lib/email-service')
      
      const emailResult = await sendInvitationEmail({
        to: email,
        inviteUrl,
        organizationName: organization?.name || 'Your Organization',
        inviterName: profile.full_name || 'Team Admin',
        expiresAt: expiresAt.toLocaleDateString()
      })

      if (!emailResult.success) {
        console.error('Failed to send invitation email:', emailResult.error)
        // Don't fail the entire invitation creation, just log the email error
        // The invitation is still created and can be resent later
      } else {
        console.log('Invitation email sent successfully:', emailResult.messageId)
      }
    } catch (emailError) {
      console.error('Email service error:', emailError)
      // Continue with invitation creation even if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        id: invitation.id,
        email: invitation.email,
        expires_at: invitation.expires_at,
        invite_url: inviteUrl
      }
    })

  } catch (error) {
    console.error('Admin invitation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
