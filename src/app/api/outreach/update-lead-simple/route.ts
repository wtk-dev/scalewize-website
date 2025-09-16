import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface UpdateLeadParams {
  leadId: string;
  organizationId: string;
  stage: 'OR1' | 'OR2' | 'OR3';
  followupDate?: string;
  followup2Date?: string;
  threadId?: string;
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

    const body: UpdateLeadParams = await request.json();

    // Basic validation
    if (!body.leadId || !body.organizationId || !body.stage) {
      return NextResponse.json({ error: 'leadId, organizationId, and stage are required' }, { status: 400 });
    }

    // Verify user has access to this organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile || profile.organization_id !== body.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Prepare update data based on stage
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.stage === 'OR1') {
      updateData.or1_sent = true;
      updateData.or1_sent_at = new Date().toISOString();
      updateData.followup_trigger = true;
      if (body.followupDate) {
        updateData.followup_date = body.followupDate;
      }
      updateData.outreach_stage = 'OR1';
    } else if (body.stage === 'OR2') {
      updateData.or2_sent = true;
      updateData.or2_sent_at = new Date().toISOString();
      updateData.followup_2_trigger = true;
      if (body.followup2Date) {
        updateData.followup_2_date = body.followup2Date;
      }
      updateData.outreach_stage = 'OR2';
    } else if (body.stage === 'OR3') {
      updateData.or3_sent = true;
      updateData.or3_sent_at = new Date().toISOString();
      updateData.outreach_stage = 'COMPLETE';
    }

    if (body.threadId) {
      updateData.thread_id = body.threadId;
    }

    // Update the lead
    const { data: updatedLead, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', body.leadId)
      .eq('organization_id', body.organizationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead:', error);
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      lead: updatedLead 
    });

  } catch (error) {
    console.error('Error in update-lead API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
