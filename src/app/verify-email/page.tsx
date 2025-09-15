'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { Loader2, CheckCircle, XCircle, Mail, AlertCircle } from 'lucide-react'
import Link from 'next/link'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (token && email) {
      verifyEmail()
    } else {
      setError('Invalid verification link. Missing token or email.')
      setLoading(false)
    }
  }, [token, email])

  const verifyEmail = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!token || !email) {
        setError('Invalid verification link. Missing token or email.')
        setLoading(false)
        return
      }

      // Get user profile with organization details
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          organization_id,
          organizations!profiles_organization_id_fkey (
            id,
            name,
            slug
          )
        `)
        .eq('email', email)
        .single()

      if (profileError || !profileData) {
        console.error('Profile not found:', profileError)
        setError('User profile not found. Please contact support.')
        setLoading(false)
        return
      }

      // Update user's verification status in the database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          is_verified: true,
          email_verified_at: new Date().toISOString()
        })
        .eq('email', email)

      if (updateError) {
        console.error('Error updating verification status:', updateError)
        setError('Failed to verify email. Please try again.')
        setLoading(false)
        return
      }

      // Update the auth user's email_confirmed_at using admin client
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseAdmin = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        profileData.id,
        {
          email_confirm: true
        }
      )

      if (authUpdateError) {
        console.error('Error updating auth user:', authUpdateError)
        // Don't fail the entire process, the profile update succeeded
      }

      setSuccess(true)
      setUser(profileData)

      // Redirect to organization dashboard after 5 seconds
      setTimeout(() => {
        const organization = (profileData as any).organizations
        if (organization?.slug) {
          router.push(`/dashboard?org=${organization.slug}`)
        } else {
          router.push('/dashboard')
        }
      }, 5000)

    } catch (err) {
      console.error('Error verifying email:', err)
      setError('Failed to verify email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4" style={{ color: "#595F39" }} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h1>
          <p className="text-gray-600">Please wait while we verify your email address...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="text-white py-2 px-4 rounded-md hover:opacity-90 transition-colors inline-block" style={{ backgroundColor: "#595F39" }}
            >
              Go to Login
            </Link>
            <Link
              href="/"
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors inline-block"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    const organization = user ? (user as any).organizations : null
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <CheckCircle className="mx-auto mb-4" style={{ color: "#595F39" }} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
          <p className="text-gray-600 mb-4">
            Your email has been successfully verified. Welcome to your organization!
          </p>
          <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: "rgba(89, 95, 57, 0.1)", borderColor: "rgba(89, 95, 57, 0.3)" }}>
            <p style={{ color: "rgba(89, 95, 57, 0.8)" }}>
              <strong>Welcome to {organization?.name || 'your organization'}!</strong> You're now a verified member and will be redirected to your dashboard.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Redirecting to your organization dashboard in 5 seconds...
          </p>
        </div>
      </div>
    )
  }

  return null
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 style={{ color: "#595F39" }} />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
