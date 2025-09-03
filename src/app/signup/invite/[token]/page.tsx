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

      // TODO: Replace with actual API call to validate invitation
      // For now, we'll simulate the validation with the actual token from the logs
      const mockInvitation = {
        id: 'mock-invite-id',
        email: 'sebbydkeating@gmail.com', // This should come from the actual invitation
        organizationName: 'seb inc',
        inviterName: 'Team Admin',
        expiresAt: new Date(Date.now() + 86400000).toISOString(), // Expires tomorrow
        status: 'pending' as const
      }

      // Simulate validation logic - accept any valid UUID format token
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (uuidRegex.test(token)) {
        if (new Date(mockInvitation.expiresAt) < new Date()) {
          setError('This invitation has expired.')
        } else {
          setInvitation(mockInvitation)
          setFormData(prev => ({ ...prev, fullName: mockInvitation.email.split('@')[0] }))
        }
      } else {
        setError('Invalid invitation token.')
      }
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
          email: invitation.email
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
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
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
                 <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                 <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to {invitation?.organizationName}!</h1>
                 <p className="text-gray-600 mb-4">
                   Your account has been created successfully. Please log in to access your dashboard.
                 </p>
                 <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                   <p className="text-sm text-green-800">
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
          <UserPlus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Join {invitation?.organizationName}</h2>
          <p className="mt-2 text-sm text-gray-600">
            You've been invited by {invitation?.inviterName}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Building2 className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">Organization Details</span>
            </div>
            <p className="text-sm text-blue-800">
              <strong>Organization:</strong> {invitation?.organizationName}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Email:</strong> {invitation?.email}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Invited by:</strong> {invitation?.inviterName}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={signingUp}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
