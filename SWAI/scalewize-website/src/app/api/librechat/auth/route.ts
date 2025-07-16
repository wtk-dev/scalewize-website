import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { libreChatAuth } from '@/lib/librechat-auth'

export async function POST(request: NextRequest) {
  try {
    // Create Supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          },
        },
      }
    )

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user profile and organization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        organizations (*)
      `)
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const organization = profile.organizations

    // Generate LibreChat JWT token
    const token = await libreChatAuth.generateLibreChatToken(userId)

    // Return the token and user info
    return NextResponse.json({
      token,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.full_name || profile.email,
        username: profile.email.split('@')[0],
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.email)}&background=0D9488&color=fff`,
        role: profile.role,
        organization: {
          id: organization.id,
          name: organization.name,
          domain: organization.domain,
          plan_type: organization.plan_type,
          librechat_config: organization.librechat_config || {}
        }
      }
    })

  } catch (error) {
    console.error('LibreChat auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Create Supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          },
        },
      }
    )

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user profile and organization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        organizations (*)
      `)
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const organization = profile.organizations

    // Generate LibreChat URL
    const libreChatUrl = await libreChatAuth.getLibreChatURL(userId, organization.domain || '')

    return NextResponse.json({
      url: libreChatUrl,
      organization: {
        id: organization.id,
        name: organization.name,
        domain: organization.domain,
        plan_type: organization.plan_type
      }
    })

  } catch (error) {
    console.error('LibreChat URL generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 