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
        await fetchProfile(session.user.id)
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
          await fetchProfile(session.user.id)
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
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (profileError) {
        console.error('fetchProfile error:', profileError)
        // If no profile exists, create one
        if (profileError.code === 'PGRST116') { // No rows returned
          console.log('No profile found, creating new profile...')
          const { data: user } = await supabase.auth.getUser()
          if (user?.user) {
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
          setProfile(null)
          setOrganization(null)
        }
        return
      }
      
      console.log('fetchProfile result:', profileData)
      setProfile(profileData)
      
      if (profileData?.organization_id) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.organization_id)
          .single()
        if (orgError) {
          console.error('fetchProfile organization error:', orgError)
          setOrganization(null)
        } else {
          console.log('fetchProfile organization result:', orgData)
          setOrganization(orgData)
        }
      } else {
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
      {loading ? <div style={{ color: 'white' }}>Loading...</div> : children}
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