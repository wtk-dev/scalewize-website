'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Bot, Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

function LoginPageInner() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Login page session:', session);
      if (
        session &&
        session.user &&
        (!session.expires_at || session.expires_at * 1000 > Date.now())
      ) {
        // Try fetching the user's profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        console.log('Profile fetch after login:', data, error);

        if (data && !error) {
          console.log('Redirecting to /dashboard');
          router.push('/dashboard');
        } else {
          console.log('Profile fetch failed, forcing logout');
          // Session is invalid for data fetches, force logout
          await supabase.auth.signOut();
          localStorage.clear();
          sessionStorage.clear();
          document.cookie.split(';').forEach((c) => {
            if (c.includes('sb-')) {
              document.cookie = c
                .replace(/^ +/, '')
                .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
            }
          });
          setCheckingSession(false);
        }
      } else {
        console.log('No valid session, showing login form');
        setCheckingSession(false);
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted'); // Debug print
    setLoading(true);
    setError('');

    try {
      console.log('Calling supabase.auth.signInWithPassword with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('Supabase signInWithPassword result:', data, error);

      if (error) {
        setError(error.message);
        setLoading(false);
        console.error('Supabase login error:', error); // Log error for debugging
        return;
      }

      if (!data || !data.user) {
        setError('No user returned from Supabase');
        setLoading(false);
        console.error('No user returned from Supabase:', data);
        return;
      }

      // Fetch profile after login
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      console.log('Profile fetch after login:', profile, profileError);

      if (profile && !profileError) {
        console.log('Redirecting to', redirectTo);
        window.location.href = redirectTo;
      } else {
        setError('Profile not found');
        setLoading(false);
        console.error('Profile fetch failed:', profileError);
      }
    } catch (err) {
      console.log('Login handler exception:', err);
      setError('Unexpected error');
      setLoading(false);
    }
    console.log('Login handler finished');
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Bot className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to ScaleWize AI
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your organization's AI automation platform
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <LoginPageInner />;
} 