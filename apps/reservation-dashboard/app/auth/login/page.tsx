"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../../lib/supabase";
import { Eye } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Handle hydration by waiting for client-side rendering
  useEffect(() => {
    setIsClient(true);
    
    // Check if there are URL parameters to preserve
    const params = new URLSearchParams(window.location.search).toString();
    if (params) {
      localStorage.setItem('propertyParams', params);
      console.log("Saved URL parameters:", params);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Sign in with email and password
      const { error } = await auth.signIn(email, password);
      
      if (error) {
        setError(error.message);
        return;
      }

      // Clear any user-non-specific profile data from localStorage for security
      // This prevents data leakage between users
      localStorage.removeItem('userProfile');
      localStorage.removeItem('isProfileComplete');
      
      // After successful login, redirect to dashboard with the preserved URL parameters
      const savedParams = localStorage.getItem('propertyParams');
      if (savedParams) {
        router.push(`/dashboard?${savedParams}`);
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      setError(error.message || "Authentication failed. Please check your credentials.");
      console.error("Auth error:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignUp = () => {
    router.push('/'); // Navigate to the main page which has the sign-up form
  };

  // Only render the form after client-side hydration
  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your Spain Dream Home dashboard
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pr-10"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <Eye className="text-gray-500 h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <button
            onClick={handleSignUp}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Need an account? Sign up
          </button>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/')}
            className="font-medium text-gray-600 hover:text-gray-500"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}