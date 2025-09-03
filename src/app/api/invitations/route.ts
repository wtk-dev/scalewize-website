import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
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

    // Get user session using cookies
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

    // Get user's profile to verify admin access
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('organization_id, role')
      .eq('id', userId)
      .in('role', ['admin', 'super_admin'])
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'You must be an admin to view invitations' },
        { status: 403 }
      )
    }

    const organizationId = (profile as any).organization_id

    // Fetch invitations for the organization
    const { data: invitations, error: invitationsError } = await supabaseAdmin
      .from('invitations')
      .select(`
        *,
        inviter:profiles!invitations_invited_by_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (invitationsError) {
      console.error('Failed to fetch invitations:', invitationsError)
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      )
    }

    // Clean up expired invitations
    const now = new Date().toISOString()
    const expiredInvitations = invitations?.filter((inv: any) => 
      inv.status === 'pending' && new Date(inv.expires_at) < new Date()
    ) || []

    if (expiredInvitations.length > 0) {
      await supabaseAdmin
        .from('invitations')
        .update({ status: 'expired', updated_at: now } as any)
        .in('id', expiredInvitations.map((inv: any) => inv.id))
    }

    // Return updated invitations
    const updatedInvitations = invitations?.map((inv: any) => ({
      ...inv,
      status: inv.status === 'pending' && new Date(inv.expires_at) < new Date() 
        ? 'expired' 
        : inv.status
    })) || []

    return NextResponse.json({
      success: true,
      data: updatedInvitations
    })

  } catch (error) {
    console.error('Fetch invitations API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('id')

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
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

    // Get user session using cookies
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

    // Verify user is admin of the organization that owns this invitation
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('invitations')
      .select(`
        *,
        organization:organizations!invitations_organization_id_fkey (
          id
        )
      `)
      .eq('id', invitationId)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check if user is admin of this organization
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('organization_id, role')
      .eq('id', userId)
      .eq('organization_id', invitation.organization_id)
      .in('role', ['admin', 'super_admin'])
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'You must be an admin to cancel invitations' },
        { status: 403 }
      )
    }

    // Cancel the invitation
    const { error: deleteError } = await supabaseAdmin
      .from('invitations')
      .update({ 
        status: 'cancelled', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', invitationId)

    if (deleteError) {
      console.error('Failed to cancel invitation:', deleteError)
      return NextResponse.json(
        { error: 'Failed to cancel invitation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation cancelled successfully'
    })

  } catch (error) {
    console.error('Cancel invitation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
