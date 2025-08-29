// Script to update lead statuses after importing new LinkedIn messages
// Now supports PENDING status for queued leads
// Run this script every time you import new messages from LinkedIn

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '../.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function updateLeadStatuses() {
  console.log('🔄 Starting lead status update process...')
  
  try {
    // 1. Get all leads and messages
    console.log('📊 Fetching leads and messages...')
    
    const [leadsResponse, messagesResponse] = await Promise.all([
      supabase
        .from('leads')
        .select('*')
        .not('organization_id', 'is', null),
      supabase
        .from('messages')
        .select('*')
        .in('message_type', ['connection_request', 'first_message', 'response'])
        .not('organization_id', 'is', null)
    ])

    if (leadsResponse.error) throw leadsResponse.error
    if (messagesResponse.error) throw messagesResponse.error

    const leads = leadsResponse.data || []
    const messages = messagesResponse.data || []
    
    console.log(`📈 Found ${leads.length} leads and ${messages.length} messages`)

    // 2. Reset all non-PENDING lead statuses to start fresh
    console.log('🔄 Resetting all non-PENDING lead statuses...')
    
    const resetResponse = await supabase
      .from('leads')
      .update({
        status: 'SENT',
        connection_request_sent_at: null,
        first_message_sent_at: null,
        last_contact_at: null,
        updated_at: new Date().toISOString()
      })
      .not('organization_id', 'is', null)
      .not('status', 'eq', 'PENDING')

    if (resetResponse.error) throw resetResponse.error
    console.log(`✅ Reset ${resetResponse.count || 0} leads`)

    // 3. Update connection_request_sent_at for non-PENDING leads with connection requests
    console.log('📤 Updating connection request timestamps...')
    
    for (const lead of leads) {
      if (!lead.linkedin_url || lead.status === 'PENDING') continue
      
      const connectionRequests = messages.filter(msg => 
        msg.recipient_linkedin_url === lead.linkedin_url &&
        msg.message_type === 'connection_request' &&
        msg.organization_id === lead.organization_id
      )
      
      if (connectionRequests.length > 0) {
        const earliestRequest = connectionRequests.sort((a, b) => 
          new Date(a.message_date || 0) - new Date(b.message_date || 0)
        )[0]
        
        await supabase
          .from('leads')
          .update({
            connection_request_sent_at: earliestRequest.message_date,
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id)
      }
    }

    // 4. Update first_message_sent_at and status to CONNECTED for non-PENDING leads with first messages
    console.log('🤝 Updating connection status...')
    
    for (const lead of leads) {
      if (!lead.linkedin_url || lead.status === 'PENDING') continue
      
      const firstMessages = messages.filter(msg => 
        msg.recipient_linkedin_url === lead.linkedin_url &&
        msg.message_type === 'first_message' &&
        msg.organization_id === lead.organization_id
      )
      
      if (firstMessages.length > 0) {
        const earliestMessage = firstMessages.sort((a, b) => 
          new Date(a.message_date || 0) - new Date(b.message_date || 0)
        )[0]
        
        await supabase
          .from('leads')
          .update({
            first_message_sent_at: earliestMessage.message_date,
            status: 'CONNECTED',
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id)
      }
    }

    // 5. Update status to RESPONDED for non-PENDING leads with responses
    console.log('💬 Updating response status...')
    
    for (const lead of leads) {
      if (!lead.linkedin_url || lead.status === 'PENDING') continue
      
      const responses = messages.filter(msg => 
        msg.sender_linkedin_url === lead.linkedin_url &&
        msg.message_type === 'response' &&
        msg.organization_id === lead.organization_id
      )
      
      if (responses.length > 0) {
        await supabase
          .from('leads')
          .update({
            status: 'RESPONDED',
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id)
      }
    }

    // 6. Update status to ACTIVE for non-PENDING leads with multiple responses
    console.log('🔥 Updating active conversation status...')
    
    for (const lead of leads) {
      if (!lead.linkedin_url || lead.status === 'PENDING') continue
      
      const responses = messages.filter(msg => 
        msg.sender_linkedin_url === lead.linkedin_url &&
        msg.message_type === 'response' &&
        msg.organization_id === lead.organization_id
      )
      
      if (responses.length > 1) {
        await supabase
          .from('leads')
          .update({
            status: 'ACTIVE',
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id)
      }
    }

    // 7. Update last_contact_at for all leads
    console.log('📅 Updating last contact timestamps...')
    
    for (const lead of leads) {
      if (!lead.linkedin_url) continue
      
      const leadMessages = messages.filter(msg => 
        (msg.sender_linkedin_url === lead.linkedin_url || msg.recipient_linkedin_url === lead.linkedin_url) &&
        msg.organization_id === lead.organization_id
      )
      
      if (leadMessages.length > 0) {
        const latestMessage = leadMessages.sort((a, b) => 
          new Date(b.message_date || 0) - new Date(a.message_date || 0)
        )[0]
        
        await supabase
          .from('leads')
          .update({
            last_contact_at: latestMessage.message_date,
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id)
      }
    }

    // 8. Show final status distribution
    console.log('📊 Final status distribution:')
    
    const statusDistribution = await supabase
      .from('leads')
      .select('status')
      .not('organization_id', 'is', null)

    if (statusDistribution.data) {
      const statusCounts = {}
      statusDistribution.data.forEach(lead => {
        statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1
      })
      
      const total = statusDistribution.data.length
      Object.entries(statusCounts).forEach(([status, count]) => {
        const percentage = ((count / total) * 100).toFixed(1)
        console.log(`  ${status}: ${count} (${percentage}%)`)
      })
    }

    // 9. Show summary statistics
    console.log('📈 Summary statistics:')
    
    const totalLeads = leads.length
    const connectionRequestsSent = leads.filter(l => l.connection_request_sent_at).length
    const connectionsMade = leads.filter(l => l.first_message_sent_at).length
    const responsesReceived = leads.filter(l => ['RESPONDED', 'ACTIVE', 'BOOKED', 'CLOSED'].includes(l.status)).length
    const activeConversations = leads.filter(l => ['RESPONDED', 'ACTIVE', 'BOOKED', 'CLOSED'].includes(l.status)).length

    console.log(`  Total Leads: ${totalLeads}`)
    console.log(`  Connection Requests Sent: ${connectionRequestsSent}`)
    console.log(`  Connections Made: ${connectionsMade}`)
    console.log(`  Responses Received: ${responsesReceived}`)
    console.log(`  Active Conversations: ${activeConversations}`)

    console.log('✅ Lead status update completed successfully!')
    
  } catch (error) {
    console.error('❌ Error updating lead statuses:', error)
    throw error
  }
}

// Run the script
if (require.main === module) {
  updateLeadStatuses()
    .then(() => {
      console.log('🎉 Script completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Script failed:', error)
      process.exit(1)
    })
}

module.exports = { updateLeadStatuses } 