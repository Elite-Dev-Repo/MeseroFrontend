"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail } from "lucide-react";
import { requestPasswordReset } from "@/lib/authApi";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not send reset email. Try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <Image
            src="/logo.png"
            alt="Mesero logo"
            width={632}
            height={395}
            className="h-12 w-12 object-cover"
          />
          <span className="font-display font-bold text-2xl text-neutral-900">Mesero</span>
        </Link>
        <h1 className="text-2xl font-display font-bold text-neutral-900">Forgot your password?</h1>
        <p className="text-neutral-500 mt-2">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <Card>
        {sent ? (
          <>
            <CardHeader className="pb-4">
              <CardTitle>Check your inbox</CardTitle>
              <CardDescription>
                If an account exists for <span className="font-medium text-neutral-700">{email}</span>,
                you&apos;ll receive a password reset link shortly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg bg-surface-tertiary p-4 text-sm text-neutral-600">
                <Mail className="h-5 w-5 shrink-0 text-primary-600" />
                <p>
                  Didn&apos;t get the email? Check your spam folder, or try again with a
                  different address.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => setSent(false)}
              >
                Use a different email
              </Button>
            </CardContent>
            <CardFooter>
              <Link
                href="/login"
                className="mx-auto flex items-center gap-2 text-sm text-primary-600 font-medium hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="pb-4">
              <CardTitle>Reset password</CardTitle>
              <CardDescription>We&apos;ll email you a link to reset it</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={handleChange}
                      disabled={submitting}
                      className="pl-10"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" loading={submitting}>
                  Send reset link
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <Link
                href="/login"
                className="mx-auto flex items-center gap-2 text-sm text-primary-600 font-medium hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
