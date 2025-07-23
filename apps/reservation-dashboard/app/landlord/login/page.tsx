"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import Link from "next/link";
// Commented out Firebase imports - migrating to Supabase
// import { collection, query, where, getDocs } from "firebase/firestore";
// import { db } from "@/firebase"; // Make sure path is correct

export default function LandlordLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // For demo/development - still allow admin/admin to work
      if (email === "admin" && password === "admin") {
        localStorage.setItem("landlordLoggedIn", "true");
        localStorage.setItem("landlordEmail", "admin@example.com"); // Set a demo email
        router.push("/landlord");
        return;
      }

      // Commented out Firebase code - migrating to Supabase
      // const ownersRef = collection(db, "propertyOwners");
      // const ownerQuery = query(ownersRef, where("email", "==", email));
      // const ownerSnapshot = await getDocs(ownerQuery);

      // if (ownerSnapshot.empty) {
      //   setError("No account found with this email. Please check your credentials.");
      //   setLoading(false);
      //   return;
      // }
      
      // TODO: Replace with Supabase authentication
      // For now, allow any email with password "password" for testing

      // In a real app, you would validate the password here
      // For this demo, we'll just check if the password is "password"
      // In production, you would use proper authentication with Firebase Auth
      if (password !== "password") {
        setError("Invalid password");
        setLoading(false);
        return;
      }

      // Store login state and email in localStorage
      localStorage.setItem("landlordLoggedIn", "true");
      localStorage.setItem("landlordEmail", email);
      
      // Navigate to landlord dashboard
      router.push("/landlord");
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Landlord Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage property reservations
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pr-10"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <Eye className="text-gray-500" />
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            <p>For demo, use credentials: admin / admin</p>
            <p>Or use any property owner's email with password: password</p>
            <p className="mt-2">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                Return to Home
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}