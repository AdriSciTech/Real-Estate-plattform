// 3. app/auth/signup/page.tsx
"use client";

import { useState } from "react";
import { auth } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    try {
      const { error } = await auth.signUp(email, password);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/"); // Redirect to homepage after signup
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-4">Sign Up</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2 p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-2 p-2 border rounded"
      />
      <button
        onClick={handleSignUp}
        className="px-6 py-2 bg-green-600 text-white rounded-lg mb-2"
      >
        Sign Up
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </main>
  );
}
