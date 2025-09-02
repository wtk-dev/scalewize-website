import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      )
    }

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

    // Fetch invitation details using the token
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('invitations')
      .select(`
        id,
        email,
        role,
        status,
        expires_at,
        created_at,
        organization_id,
        organizations!invitations_organization_id_fkey (
          name
        ),
        inviter:profiles!invitations_invited_by_fkey (
          full_name
        )
      `)
      .eq('token', token)
      .single()

    if (invitationError || !invitation) {
      console.error('Invitation not found:', invitationError)
      return NextResponse.json(
        { error: 'Invalid or expired invitation link' },
        { status: 404 }
      )
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'This invitation has already been used or cancelled' },
        { status: 400 }
      )
    }

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 400 }
      )
    }

    // Return invitation details
    return NextResponse.json({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expires_at: invitation.expires_at,
      created_at: invitation.created_at,
      organization_id: invitation.organization_id,
      organization_name: (invitation.organizations as any)?.name,
      inviter_name: (invitation.inviter as any)?.full_name
    })

  } catch (error) {
    console.error('Validate invitation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
