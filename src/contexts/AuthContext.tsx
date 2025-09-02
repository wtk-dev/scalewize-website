// @ts-nocheck
"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Profile, Organization } from '@/types/database'

interface AuthContextType {
  user: any
  profile: Profile | null
  organization: Organization | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fallback to prevent infinite loading
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      console.log('AuthProvider: Fallback timer triggered - forcing loading to false')
      setLoading(false)
    }, 15000) // 15 second fallback

    return () => clearTimeout(fallbackTimer)
  }, [])

  useEffect(() => {
    let unsubscribed = false
    console.log('AuthProvider useEffect running')

    async function loadSession() {
      setLoading(true)
      console.log('Calling supabase.auth.getSession()')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('supabase.auth.getSession() result:', session)
      if (unsubscribed) return
      setUser(session?.user ?? null)
      if (session?.user) {
        // Add timeout for profile fetch
        const profilePromise = fetchProfile(session.user.id)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
        )
        
        try {
          await Promise.race([profilePromise, timeoutPromise])
        } catch (error) {
          console.error('Profile fetch failed or timed out:', error)
          // Continue with loading false even if profile fetch fails
        }
      }
      setLoading(false)
      console.log('AuthProvider setLoading(false) after loadSession')
    }

    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (unsubscribed) return
        console.log('onAuthStateChange event:', event, 'session:', session)
        setUser(session?.user ?? null)
        if (session?.user) {
          // Add timeout for profile fetch in auth state change
          const profilePromise = fetchProfile(session.user.id)
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
          )
          
          try {
            await Promise.race([profilePromise, timeoutPromise])
          } catch (error) {
            console.error('Profile fetch failed or timed out in auth state change:', error)
            // Continue with loading false even if profile fetch fails
          }
        } else {
          setProfile(null)
          setOrganization(null)
          if (window.location.pathname !== '/login') {
            router.push('/login')
          }
        }
        setLoading(false)
        console.log('AuthProvider setLoading(false) after onAuthStateChange')
      }
    )

    return () => {
      unsubscribed = true
      subscription.unsubscribe()
    }
  }, [router])

  const fetchProfile = async (userId: any, retryCount = 0) => {
    console.log('fetchProfile called with userId:', userId, 'retry:', retryCount)
    try {
      console.log('Making API call to get-profile endpoint...')
      
      // Use absolute URL for production compatibility
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const response = await fetch(`${baseUrl}/api/get-profile?userId=${userId}`, {
        credentials: 'include', // Ensure cookies are sent
        headers: {
          'Content-Type': 'application/json',
        }
      })
      const result = await response.json()
      
      console.log('API response:', result)
      
      if (!response.ok) {
        console.error('Profile fetch error:', result.error)
        console.error('Profile error details:', result.details)
        
        // Retry once if it's a network error and we haven't retried yet
        if (retryCount === 0 && (result.error?.includes('fetch') || result.error?.includes('network'))) {
          console.log('Retrying profile fetch...')
          setTimeout(() => fetchProfile(userId, 1), 1000)
          return
        }
        
        // If no profile exists, create one
        if (result.error === 'Profile not found') {
          console.log('No profile found, creating new profile...')
          const { data: user } = await supabase.auth.getUser()
          if (user?.user) {
            console.log('Creating profile for user:', user.user.email)
            
            // Use service role to create profile
            const createResponse = await fetch(`${baseUrl}/api/create-profile`, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: userId,
                email: user.user.email || '',
                fullName: user.user.user_metadata?.full_name || user.user.email?.split('@')[0] || 'User',
                role: 'user'
              })
            })
            
            const createResult = await createResponse.json()
            console.log('Profile creation result:', createResult)
            
            if (!createResponse.ok) {
              console.error('Error creating profile:', createResult.error)
              setProfile(null)
              setOrganization(null)
              return
            }
            
            console.log('New profile created:', createResult.profile)
            setProfile(createResult.profile)
            setOrganization(createResult.organization)
          }
        } else {
          console.log('Profile error is not "Profile not found", setting profile to null')
          setProfile(null)
          setOrganization(null)
        }
        return
      }
      
      console.log('fetchProfile result:', result.profile)
      setProfile(result.profile)
      setOrganization(result.organization)
      
    } catch (error) {
      console.error('Unexpected error in fetchProfile:', error)
      
      // Retry once if it's a network error and we haven't retried yet
      if (retryCount === 0) {
        console.log('Retrying profile fetch due to error...')
        setTimeout(() => fetchProfile(userId, 1), 1000)
        return
      }
      
      setProfile(null)
      setOrganization(null)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, profile, organization, loading, signOut }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2" style={{ borderColor: '#595F39' }}></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading ScaleWize AI</h2>
            <p className="text-gray-600">Connecting to your workspace...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 