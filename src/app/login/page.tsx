"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <span className="text-[20px] font-semibold text-[#1d1d1f] tracking-tight">
              ScholarSetu
            </span>
          </Link>
          <h2 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">
            Sign in with your email
          </h2>
          <p className="text-[13px] text-[#6e6e73]">
            Track your saved opportunities and submitted applications.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-7 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[#1d1d1f] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.edu.in"
                  className="w-full rounded-xl border border-black/[0.1] bg-white py-2.5 pl-10 pr-3.5 text-[13px] text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[12px] font-medium text-[#1d1d1f]">
                  Password
                </label>
                <a href="#" className="text-[11px] text-[#0071e3] hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-black/[0.1] bg-white py-2.5 pl-10 pr-10 text-[13px] text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f]"
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
                className="h-3.5 w-3.5 rounded accent-[#0071e3]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-[12px] text-[#6e6e73]">
                Remember this device
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-[#1d1d1f] py-2.5 text-[13px] font-medium text-white hover:bg-[#333336] transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center text-[12px] text-[#6e6e73] border-t border-black/[0.06] pt-4">
            New to ScholarSetu?{" "}
            <Link href="/signup" className="font-medium text-[#0071e3] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
