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

      // Validate token format (should be UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!token || !uuidRegex.test(token)) {
        setError('Invalid verification token.')
        setLoading(false)
        return
      }

      if (!email) {
        setError('Email address is required.')
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

      // Get the user ID and update auth user's email_confirmed_at
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (profileData?.id) {
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
      }

      setSuccess(true)

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/login')
      }, 3000)

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <CheckCircle className="mx-auto mb-4" style={{ color: "#595F39" }} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
          <p className="text-gray-600 mb-4">
            Your email has been successfully verified. You can now log in to access your organization's dashboard.
          </p>
          <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: "rgba(89, 95, 57, 0.1)", borderColor: "rgba(89, 95, 57, 0.3)" }}>
            <p style={{ color: "rgba(89, 95, 57, 0.8)" }}>
              <strong>Welcome!</strong> You're now a verified member of your organization. Please log in to continue.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Redirecting to login page...
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
