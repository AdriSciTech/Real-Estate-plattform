"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [userType, setUserType] = useState(''); // 'tenant' or 'landlord'
  
  // Mock authentication state - replace with your actual auth logic
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(''); // 'tenant' or 'landlord'

const navigation = [
  { name: 'Map', href: '/MapPage', icon: '🗺️' },
  { name: 'Properties', href: '/properties', icon: '🏠' },
  { name: 'About', href: '/about', icon: 'ℹ️' },
];

  interface AuthOptions {
    mode: 'login' | 'signup';
    type?: 'tenant' | 'landlord' | '';
  }

  const openAuth = (mode: AuthOptions['mode'], type: AuthOptions['type'] = ''): void => {
    setAuthMode(mode);
    setUserType(type);
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
    setIsAuthDropdownOpen(false);
  };

  const closeAuth = () => {
    setIsAuthModalOpen(false);
    setUserType('');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserRole('');
    // Add your logout logic here
  };

  return (
    <>
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow-md sticky top-0 z-50 h-16">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xl">🏠</span>
            <span className="font-bold text-xl text-gray-900">StudentHomes</span>
          </div>
          <span className="text-gray-500 text-sm font-medium">Madrid</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-1 text-gray-700 hover:text-blue-600 hover:underline transition-colors duration-200 font-medium"
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Desktop User Actions */}
        <div className="hidden md:block">
          {!isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-1"
              >
                Login / Sign Up
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isAuthDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => openAuth('signup', 'tenant')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <span>🎓</span>
                      <span>I'm a Tenant</span>
                    </button>
                    <button
                      onClick={() => openAuth('signup', 'landlord')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <span>🏢</span>
                      <span>I'm a Landlord</span>
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => openAuth('login')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <span>🔑</span>
                      <span>Login</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-4 items-center">
              <Link
                href="/dashboard"
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                <span>📂</span>
                <span>Dashboard</span>
              </Link>
              <button
                onClick={logout}
                className="text-red-500 hover:text-red-600 transition-colors duration-200 font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
            
            <hr className="my-2" />
            
            {!isLoggedIn ? (
              <div className="space-y-1">
                <button
                  onClick={() => openAuth('signup', 'tenant')}
                  className="w-full text-left flex items-center gap-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  <span>🎓</span>
                  <span>Sign up as Tenant</span>
                </button>
                <button
                  onClick={() => openAuth('signup', 'landlord')}
                  className="w-full text-left flex items-center gap-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  <span>🏢</span>
                  <span>Sign up as Landlord</span>
                </button>
                <button
                  onClick={() => openAuth('login')}
                  className="w-full text-left flex items-center gap-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  <span>🔑</span>
                  <span>Login</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>📂</span>
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left text-red-500 hover:text-red-600 hover:bg-gray-50 px-3 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 relative">
              {/* Close button */}
              <button
                onClick={closeAuth}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {authMode === 'login' ? 'Welcome Back!' : 'Join StudentHomes Madrid'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {authMode === 'login' 
                    ? 'Sign in to access your dashboard' 
                    : userType === 'tenant' 
                      ? 'Find your perfect student accommodation'
                      : userType === 'landlord'
                        ? 'List your property and find quality tenants'
                        : 'Choose your account type to get started'
                  }
                </p>
              </div>

              {/* User type selection for signup without pre-selected type */}
              {authMode === 'signup' && !userType && (
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setUserType('tenant')}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-left transition-all duration-200 hover:border-blue-600 hover:bg-blue-50"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🎓</span>
                      <div>
                        <div className="font-medium text-gray-900">I'm a Tenant</div>
                        <div className="text-sm text-gray-600">Find rooms, apartments, and roommates</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setUserType('landlord')}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-left transition-all duration-200 hover:border-gray-500 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🏢</span>
                      <div>
                        <div className="font-medium text-gray-900">I'm a Landlord</div>
                        <div className="text-sm text-gray-600">List properties and find student tenants</div>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Auth form */}
              {(authMode === 'login' || (authMode === 'signup' && userType)) && (
                <form className="space-y-4">
                  {authMode === 'signup' && (
                    <>
                      {/* Show selected user type */}
                      <div className={`p-3 border-2 rounded-lg ${
                        userType === 'tenant' ? 'border-blue-600 bg-blue-50' : 'border-gray-500 bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{userType === 'tenant' ? '🎓' : '🏢'}</span>
                            <span className="font-medium">
                              {userType === 'tenant' ? 'Tenant Account' : 'Landlord Account'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUserType('')}
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                          >
                            Change
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      placeholder="Enter your password"
                    />
                  </div>

                  {authMode === 'signup' && (
                    <div className="flex items-start space-x-2">
                      <input type="checkbox" id="terms" required className="mt-1" />
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        I agree to the{' '}
                        <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                      </label>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`w-full py-3 px-4 text-white font-medium rounded-lg transition-all duration-200 ${
                      userType === 'landlord' 
                        ? 'bg-gray-600 hover:bg-gray-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    >
                      {authMode === 'login' 
                        ? "Don't have an account? Sign up" 
                        : "Already have an account? Sign in"
                      }
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isAuthDropdownOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsAuthDropdownOpen(false)}
        />
      )}
    </>
  );
}