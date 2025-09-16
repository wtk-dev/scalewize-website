'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Mail, CheckCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

function VerifyEmailPendingContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const orgName = searchParams.get('org')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <Mail className="mx-auto mb-4" style={{ color: "#595F39" }} />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
        <p className="text-gray-600 mb-4">
          We've sent a verification link to <strong>{email}</strong>
        </p>
        
        {orgName && (
          <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: "rgba(89, 95, 57, 0.1)", borderColor: "rgba(89, 95, 57, 0.3)" }}>
            <p style={{ color: "rgba(89, 95, 57, 0.8)" }}>
              <strong>Welcome to {orgName}!</strong> Please verify your email to access your organization's dashboard.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="mb-2">What happens next?</p>
            <ol className="text-left space-y-1">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" style={{ color: "#595F39" }} />
                Check your email inbox
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" style={{ color: "#595F39" }} />
                Click the "Verify Email" button
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" style={{ color: "#595F39" }} />
                Get redirected to your dashboard
              </li>
            </ol>
          </div>

          <div className="pt-4">
            <p className="text-sm text-gray-500 mb-3">
              Didn't receive the email? Check your spam folder or
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="text-sm font-medium hover:opacity-80 transition-colors flex items-center justify-center mx-auto"
              style={{ color: "#595F39" }}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Resend verification email
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Already verified? Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: "#595F39" }}></div>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailPendingContent />
    </Suspense>
  )
}
