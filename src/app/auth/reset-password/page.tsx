"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { FaBoxOpen } from "react-icons/fa6";
import Button from "@/app/components/ui/Button";
import { MdEmail } from "react-icons/md";
import Alert from "@/app/components/ui/Alert";
import { FaArrowLeft } from "react-icons/fa";

export default function ForgotPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // simulate auth
    localStorage.setItem("logged_in", "true");
    router.replace("/dashboard");
  };

  return (
    <section className="min-h-screen flex flex-col justify-center items-center bg-[#F9FAFB] px-6 py-[163.5px]">
      {/* Logo */}
      <div className="bg-[#800020] py-4 px-5 rounded-full flex items-center justify-center">
        <FaBoxOpen size={30} className="text-white" />
      </div>

      {/* Header */}
      <h2 className="font-bold text-3xl text-[#111827] mt-4">
        Forgot Password?
      </h2>
      <p className="text-[#4B5563] mt-2">
        No worries, we&apos;ll send you reset instructions
      </p>

      {/* FORM */}
      <form onSubmit={handleSignIn} className="w-full mt-8 flex flex-col gap-6">
        {/* Email */}
        <div className="flex flex-col gap-2 w-full relative">
          <label htmlFor="email" className="font-medium text-sm text-gray-700">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute left-3 top-[35%] -translate-y-1/2 text-gray-400">
              <MdEmail />
            </span>
            <input
              type="email"
              id="email"
              required
              placeholder="you@company.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white 
                focus:outline-none focus:ring-2 focus:ring-[#800020]/40 focus:border-[#800020] 
                transition-all text-gray-700 placeholder:text-[#9CA3AF]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the email address associated with your account
            </p>
          </div>
        </div>

        {/* Sign In Button */}
        <Button type="submit" loading={loading} variant="primary">
          Send Reset Link
        </Button>
      </form>

      <Alert
        className="mt-6"
        variant="info"
        title="What happens next?"
        description="We'll send you an email with a secure link to reset your password. The link expires in 1 hour for security purposes."
      />
      <Alert
        className="mt-6"
        variant="security"
        title="Security Notice"
        description="If you don't receive an email within 5 minutes, check your spam folder or contact support."
      />

      <Link
        href={"/auth/signin"}
        className="text-[#800020] text-sm font-bold flex flex-row gap-2 items-center justify-center mt-8"
      >
        <FaArrowLeft /> Back to Signin
      </Link>

      <Link
        href="/auth/reset-password"
        className="text-[#800020] font-medium text-sm hover:underline mt-4"
      >
        <span className="text-[#4B5563]">Need help?</span> Contact Support
      </Link>

      {/* Sign Up Redirect */}
      <p className="mt-4 text-gray-600 text-sm">
        Don’t have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-blue-600 hover:underline font-medium"
        >
          Sign Up
        </Link>
      </p>
    </section>
  );
}
