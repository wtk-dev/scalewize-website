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
  Lock,
  User
} from 'lucide-react'

interface InvitationData {
  id: string
  email: string
  organizationName: string
  inviterName: string
  expiresAt: string
  status: 'pending' | 'accepted' | 'expired'
}

export default function InvitationSignupPage() {
  const params = useParams()
  const router = useRouter()
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signingUp, setSigningUp] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const token = params.token as string

  useEffect(() => {
    if (token) {
      validateInvitation()
    }
  }, [token])

  const validateInvitation = async () => {
    try {
      setLoading(true)
      setError(null)

      // Call the actual API to validate invitation
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
        return
      }

      const invitation = {
        id: invitationData.id,
        email: invitationData.email,
        organizationName: invitationData.organization_name,
        inviterName: invitationData.inviter_name || 'Team Admin',
        expiresAt: invitationData.expires_at,
        status: invitationData.status
      }

      setInvitation(invitation)
      // Pre-fill the form with invitation data
      setFormData(prev => ({ 
        ...prev, 
        fullName: invitation.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: invitation.email
      }))
    } catch (err) {
      console.error('Error validating invitation:', err)
      setError('Failed to validate invitation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!invitation) {
      setError('Invalid invitation')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      setSigningUp(true)
      setError(null)

      // TODO: Call invitation signup API
      const response = await fetch('/api/signup-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          fullName: formData.fullName,
          password: formData.password,
          email: formData.email
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(true)
        
        // Show success message and redirect to login
        console.log('Account created successfully:', result.message)
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(result.error || 'Failed to create account')
      }
    } catch (err) {
      console.error('Error creating account:', err)
      setError('Failed to create account. Please try again.')
    } finally {
      setSigningUp(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin style="color: #595F39" mx-auto mb-4" />
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }

           if (success) {
           return (
             <div className="min-h-screen flex items-center justify-center bg-gray-50">
               <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                 <CheckCircle className="h-16 w-16 style="color: #595F39" mx-auto mb-4" />
                 <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to {invitation?.organizationName}!</h1>
                 <p className="text-gray-600 mb-4">
                   Your account has been created successfully. Please log in to access your dashboard.
                 </p>
                 <div className="style="backgroundColor: rgba(89, 95, 57, 0.1)" border style="borderColor: rgba(89, 95, 57, 0.3)" rounded-lg p-4 mb-6">
                   <p className="text-sm style="color: rgba(89, 95, 57, 0.8)"">
                     <strong>Success!</strong> You're now a member of {invitation?.organizationName} and have access to all AI tools and features.
                   </p>
                 </div>
                 <p className="text-sm text-gray-500">
                   Redirecting you to the login page...
                 </p>
               </div>
             </div>
           )
         }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <UserPlus className="h-12 w-12 style="color: #595F39" mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Join {invitation?.organizationName}</h2>
          <p className="mt-2 text-sm text-gray-600">
            You've been invited by {invitation?.inviterName}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6 p-4 style="backgroundColor: rgba(89, 95, 57, 0.1)" border style="borderColor: rgba(89, 95, 57, 0.3)" rounded-lg">
            <div className="flex items-center mb-3">
              <Building2 className="h-5 w-5 style="color: #595F39" mr-2" />
              <span className="font-medium style="color: rgba(89, 95, 57, 0.9)"">Invitation Details</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium style="color: rgba(89, 95, 57, 0.8)"">Organization:</span>
                <span className="text-sm style="color: rgba(89, 95, 57, 0.8)"">{invitation?.organizationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium style="color: rgba(89, 95, 57, 0.8)"">Email:</span>
                <span className="text-sm style="color: rgba(89, 95, 57, 0.8)"">{invitation?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium style="color: rgba(89, 95, 57, 0.8)"">Invited by:</span>
                <span className="text-sm style="color: rgba(89, 95, 57, 0.8)"">{invitation?.inviterName}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  readOnly
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Email address from invitation"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">This email is from your invitation and cannot be changed</p>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#595F39] focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#595F39] focus:border-transparent"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#595F39] focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={signingUp}
              className="w-full style="backgroundColor: #595F39" text-white py-2 px-4 rounded-md hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {signingUp ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join Organization
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to join {invitation?.organizationName} and 
              abide by their terms and policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
