"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        // 1. Create user in database via /api/register
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Registration failed.");
          setLoading(false);
          return;
        }

        // 2. Automatically log in after registration
        const signInRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInRes?.error) {
          setError("Account created, but failed to log in automatically.");
        } else {
          router.push("/");
          router.refresh();
        }
      } else {
        // Sign in existing user via NextAuth
        const signInRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInRes?.error) {
          setError("Invalid email or password.");
        } else {
          router.push("/");
          router.refresh();
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#1e1e1e] p-6 font-sans">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-800/50 bg-[#242424] p-8 shadow-2xl">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-serif text-gray-200">
            {isSignUp ? "Create an account" : "Web3 Copilot"}
          </h1>
          <p className="text-sm text-gray-400">
            {isSignUp
              ? "Enter your details to get started"
              : "Sign in to access your smart contract audits"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium text-gray-300">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex"
                className="w-full rounded-xl border border-[#404040] bg-[#303030] px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:border-[#505050] focus:outline-none transition-colors"
              />
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full rounded-xl border border-[#404040] bg-[#303030] px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:border-[#505050] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#404040] bg-[#303030] px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:border-[#505050] focus:outline-none transition-colors"
            />
          </div>

          {error && <p className="text-sm text-red-400 text-center font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#d0a786] py-3 text-sm font-bold text-gray-900 transition hover:bg-[#b89070] disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : isSignUp
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        <div className="text-center text-sm pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-gray-500 hover:text-gray-300 underline underline-offset-4 transition-colors"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}
