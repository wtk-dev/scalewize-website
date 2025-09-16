import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface GetStatsParams {
  organizationId: string;
  campaignId?: string;
}

interface UpdateStatsParams {
  organizationId: string;
  campaignId: string;
  stage: 'OR1' | 'OR2' | 'OR3';
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

    const params: GetStatsParams = {
      organizationId: searchParams.get('organizationId') || '',
      campaignId: searchParams.get('campaignId') || undefined,
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

    // Get current date in ET
    const tz = 'America/New_York';
    const now = new Date();
    const etDate = new Date(now.toLocaleString('en-US', { timeZone: tz })).toISOString().split('T')[0];

    let query = supabase
      .from('outreach_daily_stats')
      .select('*')
      .eq('organization_id', params.organizationId)
      .eq('date_et', etDate);

    if (params.campaignId) {
      query = query.eq('campaign_id', params.campaignId);
    }

    const { data: stats, error } = await query
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching daily stats:', error);
      return NextResponse.json({ error: 'Failed to fetch daily stats' }, { status: 500 });
    }

    const currentStats = stats?.[0] || {
      or1_count: 0,
      or2_count: 0,
      or3_count: 0,
      total_sent: 0,
    };

    return NextResponse.json({
      date_et: etDate,
      or1_count: currentStats.or1_count || 0,
      or2_count: currentStats.or2_count || 0,
      or3_count: currentStats.or3_count || 0,
      total_sent: currentStats.total_sent || 0,
    });
  } catch (error) {
    console.error('Error in daily stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const body = await request.json();

    const params: UpdateStatsParams = body;

    // Basic validation
    if (!params.organizationId || !params.campaignId || !params.stage) {
      return NextResponse.json({ error: 'organizationId, campaignId, and stage are required' }, { status: 400 });
    }

    if (!['OR1', 'OR2', 'OR3'].includes(params.stage)) {
      return NextResponse.json({ error: 'Invalid stage. Must be OR1, OR2, or OR3' }, { status: 400 });
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

    // Get current date in ET
    const tz = 'America/New_York';
    const now = new Date();
    const etDate = new Date(now.toLocaleString('en-US', { timeZone: tz })).toISOString().split('T')[0];

    // Get current stats
    const { data: existingStats } = await supabase
      .from('outreach_daily_stats')
      .select('*')
      .eq('organization_id', params.organizationId)
      .eq('campaign_id', params.campaignId)
      .eq('date_et', etDate)
      .single();

    const currentStats = existingStats || {
      or1_count: 0,
      or2_count: 0,
      or3_count: 0,
      total_sent: 0,
    };

    // Calculate new counts
    const newCounts = {
      or1_count: params.stage === 'OR1' ? (currentStats.or1_count || 0) + 1 : (currentStats.or1_count || 0),
      or2_count: params.stage === 'OR2' ? (currentStats.or2_count || 0) + 1 : (currentStats.or2_count || 0),
      or3_count: params.stage === 'OR3' ? (currentStats.or3_count || 0) + 1 : (currentStats.or3_count || 0),
    };
    (newCounts as any).total_sent = newCounts.or1_count + newCounts.or2_count + newCounts.or3_count;

    // Upsert the stats
    const { data: stats, error } = await supabase
      .from('outreach_daily_stats')
      .upsert({
        organization_id: params.organizationId,
        campaign_id: params.campaignId,
        date_et: etDate,
        ...newCounts,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'organization_id,campaign_id,date_et'
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating daily stats:', error);
      return NextResponse.json({ error: 'Failed to update daily stats' }, { status: 500 });
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error in update daily stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
