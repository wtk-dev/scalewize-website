import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const { email, role = 'user' } = await request.json()

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "user" or "admin"' },
        { status: 400 }
      )
    }

    // Initialize Supabase admin client for secure operations
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

    // Get user session using cookies (more reliable for Next.js)
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')
    
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      }
    )

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = session.user

    const userId = user.id
    console.log('Creating invitation for:', { email, userId, role })

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get user's profile and organization details
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        organizations!profiles_organization_id_fkey (
          id,
          name,
          slug
        )
      `)
      .eq('id', userId)
      .in('role', ['admin', 'super_admin'])
      .single()

    if (profileError || !profile) {
      console.error('Admin check failed:', profileError)
      return NextResponse.json(
        { error: 'You must be an admin to invite users' },
        { status: 403 }
      )
    }

    const organizationId = (profile as any).organization_id
    const organization = (profile as any).organizations
    console.log('Admin verification successful:', (profile as any).role)
    console.log('Organization details:', organization)

    // Validate organization exists
    if (!organizationId || !organization) {
      console.error('User has no organization or organization not found')
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 400 }
      )
    }

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
      .select('id, expires_at')
      .eq('email', email)
      .eq('organization_id', organizationId)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      // Check if existing invitation is expired
      if (new Date(existingInvitation.expires_at) < new Date()) {
        // Mark as expired and create new invitation
        await supabaseAdmin
          .from('invitations')
          .update({ status: 'expired', updated_at: new Date().toISOString() })
          .eq('id', existingInvitation.id)
      } else {
        return NextResponse.json(
          { error: 'An invitation is already pending for this email' },
          { status: 400 }
        )
      }
    }

    // Generate secure token and expiration
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Create invitation record in database
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('invitations')
      .insert({
        email,
        organization_id: organizationId,
        invited_by: userId,
        token,
        role,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (invitationError || !invitation) {
      console.error('Failed to create invitation:', invitationError)
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    console.log('Invitation created successfully:', invitation.id)

    // Create invitation URL
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${token}`

    // Send invitation email using our email service
    let emailSuccess = false
    let emailError: string | null = null

    try {
      const { sendInvitationEmail } = await import('@/lib/email-service')

      const emailResult = await sendInvitationEmail({
        to: email,
        inviteUrl,
        organizationName: organization.name || 'Your Organization',
        inviterName: (profile as any).full_name || 'Team Admin',
        expiresAt: expiresAt.toLocaleDateString()
      })

      if (!emailResult.success) {
        console.error('Failed to send invitation email:', emailResult.error)
        emailError = emailResult.error
      } else {
        console.log('Invitation email sent successfully:', emailResult.messageId)
        emailSuccess = true
      }
    } catch (emailServiceError) {
      console.error('Email service error:', emailServiceError)
      emailError = (emailServiceError as Error).message || 'Email service failed'
    }

    return NextResponse.json({
      success: true,
      message: emailSuccess ? 'Invitation sent successfully' : 'Invitation created but email failed to send',
      emailSuccess,
      emailError,
      data: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
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