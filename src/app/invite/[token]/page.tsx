'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  UserPlus, 
  Building2,
  Mail,
  Calendar,
  Shield
} from 'lucide-react'

interface InvitationData {
  id: string
  email: string
  organizationName: string
  inviterName: string
  expiresAt: string
  status: 'pending' | 'accepted' | 'expired'
}

export default function InviteAcceptancePage() {
  const params = useParams()
  const router = useRouter()
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [user, setUser] = useState<any>(null)

  const token = params.token as string

  useEffect(() => {
    if (token) {
      validateInvitation()
      checkUserAuth()
    }
  }, [token])

  const checkUserAuth = async () => {
    // For now, we'll assume the user is not logged in
    // In a real implementation, you'd check the session here
    setUser(null)
  }

  const validateInvitation = async () => {
    try {
      setLoading(true)
      setError(null)

      // Validate the invitation token by calling the API
      const response = await fetch(`/api/validate-invitation?token=${token}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Invalid or expired invitation link.')
        return
      }

      const invitationData = await response.json()
      
      // Check if invitation is expired
      if (new Date(invitationData.expires_at) < new Date()) {
        setError('This invitation has expired. Please request a new invitation.')
        setInvitation({ ...invitationData, status: 'expired' })
        return
      }

      setInvitation({
        id: invitationData.id,
        email: invitationData.email,
        organizationName: invitationData.organization_name,
        inviterName: invitationData.inviter_name || 'Team Admin',
        expiresAt: invitationData.expires_at,
        status: invitationData.status
      })
    } catch (err) {
      console.error('Error validating invitation:', err)
      setError('Invalid or expired invitation link.')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async () => {
    if (!invitation) {
      setError('Invalid invitation.')
      return
    }

    try {
      setAccepting(true)
      setError(null)

      // TODO: Implement actual invitation acceptance logic
      // This would involve:
      // 1. Verifying the invitation token
      // 2. Adding the user to the organization
      // 3. Updating the invitation status
      // 4. Redirecting to the dashboard

      // For now, simulate the acceptance
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setAccepted(true)
      
      // Redirect to invitation-specific signup page after a short delay
      setTimeout(() => {
        router.push(`/signup/invite/${token}`)
      }, 2000)

    } catch (err) {
      console.error('Error accepting invitation:', err)
      setError('Failed to accept invitation. Please try again.')
    } finally {
      setAccepting(false)
    }
  }

  const handleDeclineInvitation = () => {
    // TODO: Implement invitation decline logic
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <Loader2 style="color: #595F39"" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Validating Invitation</h2>
          <p className="text-gray-600">Please wait while we verify your invitation...</p>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            style="backgroundColor: #595F39" text-white py-2 px-4 rounded-md hover:opacity-90 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <CheckCircle style="color: #595F39" mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to the Team!</h2>
          <p className="text-gray-600 mb-6">
            You've successfully joined {invitation?.organizationName}. 
            Redirecting you to the dashboard...
          </p>
          <Loader2 style="color: #595F39"" />
        </div>
      </div>
    )
  }

  if (!invitation) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <Image src="/henly_ai_logo.png" alt="Henly AI Logo" width={120} height={30} className="h-12 w-auto mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're Invited!</h2>
          <p className="text-gray-600">
            Join <span className="font-semibold">{invitation.organizationName}</span> on Henly AI
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Building2 className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Organization</p>
              <p className="text-sm text-gray-600">{invitation.organizationName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Invited by</p>
              <p className="text-sm text-gray-600">{invitation.inviterName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Expires</p>
              <p className="text-sm text-gray-600">
                {new Date(invitation.expiresAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {invitation.status === 'expired' && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-900">Expired</p>
                <p className="text-sm text-red-600">This invitation has expired</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {invitation.status === 'expired' ? (
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Go to Homepage
          </button>
        ) : (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Click "Accept Invitation" to join this organization. You'll be redirected to create an account or sign in.
              </p>
              <button
                onClick={handleAcceptInvitation}
                disabled={accepting}
                style="backgroundColor: #595F39" text-white py-2 px-4 rounded-md hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {accepting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Accept Invitation
                  </>
                )}
              </button>
              
              <button
                onClick={handleDeclineInvitation}
                disabled={accepting}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By accepting this invitation, you agree to join the organization and 
            abide by their terms and policies.
          </p>
        </div>
      </div>
    </div>
  )
}
