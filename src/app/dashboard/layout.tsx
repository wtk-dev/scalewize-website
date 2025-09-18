'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { 
  BarChart3, 
  Users, 
  LogOut,
  Menu,
  X,
  Building2,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { AuthProvider } from '@/contexts/AuthContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  )
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, profile, organization, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: BarChart3 },
    { name: 'LinkedIn Sales', href: '/dashboard/linkedin', icon: Users },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Explore', href: '/dashboard/explore', icon: Search },
  ]

  if (profile?.role === 'admin' || profile?.role === 'super_admin') {
    navigation.push({ name: 'Admin', href: '/dashboard/admin', icon: Building2 })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center">
              <Image src="/scalewize_cover_logo.png" alt="ScaleWize AI Logo" width={360} height={80} 
                className="h-12 w-auto" />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5 text-gray-500 group-hover:text-gray-700" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: "#595F39" }}>
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-600">{organization?.name}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}`}>
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <div className="flex h-16 items-center px-4 justify-between border-b border-gray-200">
            <div className="flex items-center">
              {!sidebarCollapsed && (
                <Link href="/">
                  <Image src="/scalewize_cover_logo.png" alt="ScaleWize AI Logo" width={360} height={80} className="h-12 w-auto" />
                </Link>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-md hover:bg-gray-100"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className={`h-5 w-5 text-gray-500 group-hover:text-gray-700 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!sidebarCollapsed && item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            {!sidebarCollapsed && (
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: "#595F39" }}>
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-900">{profile?.full_name}</p>
                  <p className="text-xs text-gray-600">{organization?.name}</p>
                </div>
              </div>
            )}
            <button
              onClick={signOut}
              className={`flex items-center text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors ${sidebarCollapsed ? 'justify-center px-3 py-2.5' : 'w-full px-3 py-2.5'}`}
              title={sidebarCollapsed ? 'Sign out' : undefined}
            >
              <LogOut className={`h-5 w-5 text-gray-500 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!sidebarCollapsed && 'Sign out'}
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        {/* Header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 lg:hidden transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="min-h-screen bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
