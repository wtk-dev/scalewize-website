'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createLinkedInService } from '@/lib/linkedin-service'
import { TrendingUp, Users, MessageSquare, Calendar, BarChart3, PieChart } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

export default function AnalyticsPage() {
  const { organization, user, profile } = useAuth()
  const [linkedinMetrics, setLinkedinMetrics] = useState<Array<{
    date: string
    leads: number
    messages: number
    replies: number
  }>>([])
  const [leadSources, setLeadSources] = useState<Array<{
    source: string
    count: number
    percentage: number
  }>>([])
        const [detailedData, setDetailedData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const linkedinService = organization ? createLinkedInService(organization.id) : null

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Dashboard Supabase session:', session);
    });
    console.log('Dashboard AuthContext user:', user);
    console.log('Dashboard AuthContext profile:', profile);
    console.log('Dashboard AuthContext organization:', organization);
    if (linkedinService && organization) {
      loadAnalytics()
    }
  }, [organization?.id]) // Only reload when organization ID changes

  const loadAnalytics = async () => {
    if (!linkedinService) return

    setLoading(true)
    try {
      const [metricsData, sourcesData, detailedData] = await Promise.all([
        linkedinService.getDailyMetrics(7), // Last 7 days
        linkedinService.getLeadSources(),
        linkedinService.getDetailedMetrics()
      ])

      setLinkedinMetrics(metricsData)
      setLeadSources(sourcesData)
      // Store detailed data for enhanced analytics
      setDetailedData(detailedData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for other metrics (replace with real data later)
