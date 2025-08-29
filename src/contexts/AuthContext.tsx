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

  const fetchProfile = async (userId: any) => {
    console.log('fetchProfile called with userId:', userId)
    try {
      console.log('Making Supabase query for profile...')
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      console.log('Supabase query completed. Data:', profileData, 'Error:', profileError)
      
      if (profileError) {
        console.error('fetchProfile error:', profileError)
        // If no profile exists, create one
        if (profileError.code === 'PGRST116') { // No rows returned
          console.log('No profile found, creating new profile...')
          const { data: user } = await supabase.auth.getUser()
          if (user?.user) {
            console.log('Creating profile for user:', user.user.email)
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: user.user.email || '',
                full_name: user.user.user_metadata?.full_name || null,
                role: 'user',
                is_active: true
              })
              .select()
              .single()
            
            console.log('Profile creation result:', newProfile, 'Error:', createError)
            
            if (createError) {
              console.error('Error creating profile:', createError)
              setProfile(null)
              setOrganization(null)
              return
            }
            
            console.log('New profile created:', newProfile)
            setProfile(newProfile)
            setOrganization(null) // No organization for new users
          }
        } else {
          console.log('Profile error is not PGRST116, setting profile to null')
          setProfile(null)
          setOrganization(null)
        }
        return
      }
      
      console.log('fetchProfile result:', profileData)
      setProfile(profileData)
      
      if (profileData?.organization_id) {
        console.log('Fetching organization data for ID:', profileData.organization_id)
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.organization_id)
          .single()
        console.log('Organization query result:', orgData, 'Error:', orgError)
        if (orgError) {
          console.error('fetchProfile organization error:', orgError)
          setOrganization(null)
        } else {
          console.log('fetchProfile organization result:', orgData)
          setOrganization(orgData)
        }
      } else {
        console.log('No organization_id found, setting organization to null')
        setOrganization(null)
      }
    } catch (error) {
      console.error('Unexpected error in fetchProfile:', error)
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