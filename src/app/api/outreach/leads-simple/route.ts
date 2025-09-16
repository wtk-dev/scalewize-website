import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface GetLeadsParams {
  organizationId: string;
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

    // Use the simple function to get leads
    const { data: leads, error } = await supabase.rpc('get_available_outreach_leads', {
      org_id: params.organizationId,
      max_results: params.maxResults
    });

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }

    // Filter by stage if specified
    let filteredLeads = leads || [];
    if (params.stage) {
      filteredLeads = filteredLeads.filter(lead => {
        if (params.stage === 'OR1') {
          return !lead.followup_trigger && !lead.followup_2_trigger && !lead.or1_sent && !lead.or2_sent && !lead.or3_sent;
        } else if (params.stage === 'OR2') {
          return lead.followup_trigger && lead.followup_date && new Date(lead.followup_date) <= new Date() && !lead.or2_sent && !lead.or3_sent;
        } else if (params.stage === 'OR3') {
          return lead.followup_2_trigger && lead.followup_2_date && new Date(lead.followup_2_date) <= new Date() && !lead.or3_sent;
        }
        return true;
      });
    }

    return NextResponse.json({ 
      leads: filteredLeads,
      count: filteredLeads.length 
    });

  } catch (error) {
    console.error('Error in leads API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
