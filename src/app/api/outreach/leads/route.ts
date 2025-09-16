import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface GetLeadsParams {
  organizationId: string;
  campaignName?: string;
  maxResults?: number;
  stage?: 'OR1' | 'OR2' | 'OR3';
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
    const { searchParams } = new URL(request.url);

    const params: GetLeadsParams = {
      organizationId: searchParams.get('organizationId') || '',
      campaignName: searchParams.get('campaignName') || undefined,
      maxResults: Math.min(parseInt(searchParams.get('maxResults') || '100'), 1000),
      stage: (searchParams.get('stage') as 'OR1' | 'OR2' | 'OR3') || undefined,
    };

    // Basic validation
    if (!params.organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
    }

    // Verify user has access to this organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile || profile.organization_id !== params.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let query = supabase
      .from('leads')
      .select('*')
      .eq('organization_id', params.organizationId)
      .not('email', 'is', null)
      .neq('email', '');

    if (params.campaignName) {
      query = query.eq('campaign_name', params.campaignName);
    }

    // Filter based on stage
    if (params.stage === 'OR1') {
      query = query
        .eq('followup_trigger', false)
        .eq('followup_2_trigger', false)
        .eq('or1_sent', false)
        .eq('or2_sent', false)
        .eq('or3_sent', false);
    } else if (params.stage === 'OR2') {
      query = query
        .eq('followup_trigger', true)
        .lte('followup_date', new Date().toISOString().split('T')[0])
        .eq('or2_sent', false)
        .eq('or3_sent', false);
    } else if (params.stage === 'OR3') {
      query = query
        .eq('followup_2_trigger', true)
        .lte('followup_2_date', new Date().toISOString().split('T')[0])
        .eq('or3_sent', false);
    }

    const { data: leads, error } = await query
      .order('created_at', { ascending: true })
      .limit(params.maxResults);

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Error in outreach leads API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
