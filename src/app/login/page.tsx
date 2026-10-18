"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Demo Authentication: You are signed in as a student scholar! Redirecting to Dashboard.");
    window.location.href = "/dashboard";
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-slate-50/70 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md transition-transform group-hover:scale-105">
              <GraduationCap className="h-7 w-7" />
            </div>
          </Link>
          <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
            Welcome back to Scholar<span className="text-indigo-600">Setu</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Sign in to track verified applications and manage saved opportunities.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.edu.in"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <a href="#" className="text-[11px] font-semibold text-indigo-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 font-medium">
                Remember me on this browser
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-colors"
            >
              Sign In to ScholarSetu
            </button>
          </form>

          {/* Demo Notice */}
          <div className="mt-5 rounded-xl bg-indigo-50/70 p-3 text-[11px] text-indigo-900 border border-indigo-100 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Demo Auth:</strong> Enter any email and password to access the student tracker.
            </span>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account yet?{" "}
            <Link href="/signup" className="font-bold text-indigo-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
