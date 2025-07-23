// app/ReservationDashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../lib/supabase";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function ReservationDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      if (session) {
        // User is signed in, redirect to dashboard
        const savedParams = localStorage.getItem("propertyParams");
        if (savedParams) {
          router.push(`/ReservationDashboard/dashboard?${savedParams}`);
          localStorage.removeItem("propertyParams");
        } else {
          router.push("/ReservationDashboard/dashboard");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      const { error } = await auth.signUp(email, password);
      if (error) {
        setError(error.message);
      }
      // Auth state observer will handle redirect
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsSubmitting(true);
    setError("");
    
    try {
      // TODO: Implement Google OAuth with Supabase
      setError("Google sign-up will be implemented soon");
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppleSignUp = async () => {
    // Implement Apple sign-in functionality
    alert("Apple sign-in will be implemented later");
  };

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const handleLandlordAccess = () => {
    router.push("/landlord/login");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="max-w-md mx-auto mt-6 px-4 sm:mt-8 pb-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold">
          Spain Dream Home - Property Rentals
        </h1>
        <p className="text-gray-600 mt-2">
          Find your dream home in Spain
        </p>
      </div>

      <form onSubmit={handleSignUp}>
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="email"
            required
          />
        </div>

        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 bg-white border border-gray-300 rounded-md text-gray-900 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="mb-4 text-sm">
          By signing up, you agree to Spain Dream Home&apos;s{" "}
          <a href="/terms" className="text-blue-600 underline">
            Terms of Use
          </a>{" "}
          &{" "}
          <a href="/privacy" className="text-blue-600 underline">
            Privacy Policy
          </a>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-blue-600 text-white rounded-full font-medium mb-4 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
        >
          {isSubmitting ? "SIGNING UP..." : "SIGN UP AND AGREE"}
        </button>
      </form>

      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-gray-300"></div>
        <div className="mx-4 text-gray-500 text-sm">OR</div>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <button
        onClick={handleGoogleSignUp}
        disabled={isSubmitting}
        className="w-full py-4 border border-gray-300 rounded-full mb-4 flex items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-70"
      >
        <div className="mr-2">
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path
                fill="#4285F4"
                d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
              />
              <path
                fill="#34A853"
                d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
              />
              <path
                fill="#FBBC05"
                d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
              />
              <path
                fill="#EA4335"
                d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
              />
            </g>
          </svg>
        </div>
        <span className="text-gray-800">Sign up with Google</span>
      </button>

      <button
        onClick={handleAppleSignUp}
        disabled={isSubmitting}
        className="w-full py-4 border border-gray-300 rounded-full mb-4 flex items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-70"
      >
        <div className="mr-2">
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17.569 12.6254C17.597 15.4723 20.2103 16.3575 20.25 16.3737C20.2291 16.4452 19.8308 17.6964 18.9794 18.9853C18.2518 20.0898 17.4999 21.1856 16.3322 21.2097C15.1937 21.2325 14.7979 20.4812 13.4794 20.4812C12.1609 20.4812 11.7326 21.1856 10.6526 21.2325C9.53371 21.2782 8.6543 20.0226 7.9161 18.9225C6.4039 16.6677 5.24371 12.4254 6.79861 9.48831C7.56871 8.03071 8.91293 7.09302 10.3834 7.07019C11.4793 7.04736 12.5122 7.85331 13.2027 7.85331C13.8919 7.85331 15.1481 6.88019 16.4516 7.03362C17.0238 7.05645 18.2878 7.29834 19.1099 8.48642C19.0264 8.54327 17.5464 9.46008 17.569 12.6254M15.058 5.21254C15.6716 4.47444 16.0699 3.45776 15.9532 2.42929C15.077 2.4748 13.9981 3.06498 13.3527 3.78041C12.7833 4.41548 12.296 5.45815 12.4355 6.45814C13.4183 6.53335 14.4178 5.94894 15.058 5.21254"
              fill="#000000"
            />
          </svg>
        </div>
        <span className="text-gray-800">Sign up with Apple</span>
      </button>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-700">
          Already have an account?
        </p>
        <div className="mt-2">
          <button 
            onClick={handleLogin}
            className="w-full py-4 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
            LOG IN
          </button>
        </div>
      </div>

      <div className="text-center mt-8 border-t border-gray-200 pt-6">
        <p className="text-sm text-gray-600 mb-2">
          Property Owner?
        </p>
        <button 
          onClick={handleLandlordAccess}
          className="w-full py-4 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
          LANDLORD ACCESS
        </button>
      </div>

      {error && (
        <div className="text-red-500 mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-center">
          {error}
        </div>
      )}
    </div>
  );
}