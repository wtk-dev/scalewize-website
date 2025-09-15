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
  campaignId?: string;
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

    const params: UpdateLeadParams = body;

    // Basic validation
    if (!params.leadId || !params.organizationId || !params.stage) {
      return NextResponse.json({ error: 'leadId, organizationId, and stage are required' }, { status: 400 });
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

    // Build update object based on stage
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (params.stage === 'OR1') {
      updateData.or1_sent = true;
      updateData.or1_sent_at = new Date().toISOString();
      updateData.followup_trigger = true;
      if (params.followupDate) {
        updateData.followup_date = params.followupDate;
      }
      updateData.outreach_stage = 'OR1';
    } else if (params.stage === 'OR2') {
      updateData.or2_sent = true;
      updateData.or2_sent_at = new Date().toISOString();
      updateData.followup_2_trigger = true;
      if (params.followup2Date) {
        updateData.followup_2_date = params.followup2Date;
      }
      updateData.outreach_stage = 'OR2';
    } else if (params.stage === 'OR3') {
      updateData.or3_sent = true;
      updateData.or3_sent_at = new Date().toISOString();
      updateData.outreach_stage = 'COMPLETE';
    }

    if (params.threadId) {
      updateData.thread_id = params.threadId;
      updateData.email_thread_id = params.threadId;
    }

    // Update the lead
    const { data: lead, error: updateError } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', params.leadId)
      .eq('organization_id', params.organizationId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating lead:', updateError);
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }

    // Record the outreach message if campaign ID is provided
    if (params.campaignId) {
      const messageData = {
        organization_id: params.organizationId,
        lead_id: params.leadId,
        campaign_id: params.campaignId,
        stage: params.stage,
        email_subject: '', // Will be filled by the workflow
        email_content: '', // Will be filled by the workflow
        thread_id: params.threadId,
        sent_at: new Date().toISOString(),
        status: 'SENT',
      };

      const { error: messageError } = await supabase
        .from('outreach_messages')
        .insert(messageData);

      if (messageError) {
        console.error('Error recording outreach message:', messageError);
        // Don't fail the whole operation for this
      }
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Error in update lead API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
