'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { MessageSquare, Settings, Users, Zap, Loader2 } from 'lucide-react'
// import { libreChatAuth } from '@/lib/librechat-auth' // No longer needed for URL
import { supabase } from '@/lib/supabase-client';

export default function ChatbotPage() {
  const { user, organization } = useAuth()
  const [libreChatUrl, setLibreChatUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const getLibreChatSession = async () => {
      if (!user || !organization) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        // Get Supabase session and access token
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        // Call your backend SSO endpoint
        const libreChatBaseUrl = process.env.NEXT_PUBLIC_LIBRECHAT_URL || 'https://localhost:3080'
        const res = await fetch(`${libreChatBaseUrl}/api/auth/sso/librechat`, {
          method: 'POST',
          credentials: 'include', // send cookies (if any)
          headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
        })
        if (!res.ok) throw new Error('Failed to get LibreChat session')
        const { libreSession } = await res.json()
        // Build the LibreChat URL (use HTTPS)
        setLibreChatUrl(libreChatBaseUrl.replace('http://', 'https://'))
      } catch (err) {
        setError('Failed to connect to chat service')
      } finally {
        setLoading(false)
      }
    }
    getLibreChatSession()
  }, [user, organization])

  // Debug prints
  console.log('user:', user);
  console.log('organization:', organization);
  console.log('libreChatUrl:', libreChatUrl);

  return (
    <div className="space-y-6">
      {/* Chat Interface */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{organization?.name || 'AI'} Chatbot</h3>
              <p className="text-sm text-gray-600">
                Powered by ScaleWize AI - Connected to your business systems and databases
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            </div>
          </div>
        </div>
        <div className="h-[calc(100vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Connecting to chat service...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          ) : libreChatUrl ? (
            <iframe
              src={`${libreChatUrl}`}
              className="w-full h-full rounded-b-lg"
              title="ScaleWize AI Chatbot"
              frameBorder="0"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600">Unable to load chat interface</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 