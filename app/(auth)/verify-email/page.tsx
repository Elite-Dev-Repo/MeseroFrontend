"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Utensils, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface VerifyForm {
  email: string;
  code: string;
}

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function VerifyEmailPage() {
  const router = useRouter();
  const { verifyEmail: verifyEmailApi, resendOtp, isLoading } = useAuth();

  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState<VerifyForm>({ email: "", code: "" });
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\s/g, "");
    if (val.length <= 6) setForm((prev) => ({ ...prev, code: val }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateEmail(form.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (form.code.length !== 6) {
      toast.error("Enter the 6-digit verification code.");
      return;
    }

    setSubmitting(true);
    try {
      await verifyEmailApi(form.code, form.email);
      setShowSuccess(true);
    } catch (err: any) {
      const message = err.response?.data?.detail || "Invalid or expired code";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!validateEmail(form.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setResending(true);
    try {
      await resendOtp(form.email);
      toast.success("New code sent to your email.");
    } catch (err: any) {
      const message = err.response?.data?.detail || "Failed to resend code. Try again.";
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-display font-bold text-ink-900 mb-2">Email Verified!</h1>
        <p className="text-ink-500 mb-8">Your account has been successfully verified. You can now sign in.</p>
        <Button asChild className="w-full">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="h-12 w-12 rounded-xl bg-crimson-600 flex items-center justify-center">
            <Utensils className="h-7 w-7 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-ink-900">Mesero</span>
        </Link>
        <h1 className="text-2xl font-display font-bold text-ink-900">Verify your email</h1>
        <p className="text-ink-500 mt-2">We sent a 6-digit code to your email</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Enter verification code</CardTitle>
          <CardDescription>Check your inbox for the code</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={submitting || isLoading}
                  className="pl-10"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code *</Label>
              <Input
                id="code"
                type="text"
                name="code"
                value={form.code}
                onChange={handleOtpChange}
                placeholder="123456"
                disabled={submitting || isLoading}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
                autoComplete="one-time-code"
              />
            </div>

            <Button type="submit" className="w-full" loading={submitting || isLoading}>
              Verify Email
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-center text-sm text-ink-500">
            Didn't receive the code?{" "}
            <Button
              variant="link"
              size="sm"
              onClick={handleResend}
              loading={resending || isLoading}
            >
              Resend code
            </Button>
          </p>
          <p className="text-center text-sm text-ink-500">
            Wrong email?{" "}
            <Link href="/register" className="text-crimson-600 font-medium hover:underline">
              Sign up again
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}