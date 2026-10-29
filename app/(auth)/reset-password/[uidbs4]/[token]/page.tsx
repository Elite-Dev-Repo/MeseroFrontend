"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { validateResetToken, changePassword } from "@/lib/authApi";
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

type Status = "checking" | "valid" | "invalid" | "success";

const validatePassword = (password: string) => password.length >= 8;

export default function ResetPasswordPage() {
  const params = useParams<{ uidbs4: string; token: string }>();
  const rawUid = params?.uidbs4;
  const rawToken = params?.token;
  const uidbs4 = Array.isArray(rawUid) ? rawUid[0] : rawUid;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  const [status, setStatus] = useState<Status>("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);

  const missingParams = !uidbs4 || !token;
  const effectiveStatus: Status = missingParams ? "invalid" : status;
  const effectiveError = missingParams
    ? "This password reset link is incomplete."
    : errorMessage;

  useEffect(() => {
    if (!uidbs4 || !token) return;

    let cancelled = false;
    validateResetToken(uidbs4, token)
      .then(() => {
        if (!cancelled) setStatus("valid");
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(getErrorMessage(err, "This password reset link is invalid or has expired."));
        setStatus("invalid");
      });

    return () => {
      cancelled = true;
    };
  }, [uidbs4, token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validatePassword(form.password)) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await changePassword({
        uidbs4,
        token,
        new_password: form.password,
        confirm_password: form.confirmPassword,
      });
      setStatus("success");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not reset your password. Try again."));
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
        <h1 className="text-2xl font-display font-bold text-neutral-900">Set a new password</h1>
        <p className="text-neutral-500 mt-2">Choose a strong password for your account</p>
      </div>

      {effectiveStatus === "checking" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <p className="text-sm text-neutral-500">Validating your reset link...</p>
          </CardContent>
        </Card>
      )}

      {effectiveStatus === "invalid" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center">
            <div className="h-16 w-16 rounded-full bg-primary-50 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Link invalid or expired</h2>
              <p className="text-sm text-neutral-500">
                {effectiveError || "This password reset link is invalid or has expired."}
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/forgot-password">Request a new link</Link>
            </Button>
          </CardContent>
          <CardFooter>
            <Link
              href="/login"
              className="mx-auto text-sm text-primary-600 font-medium hover:underline"
            >
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      )}

      {effectiveStatus === "success" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center">
            <div className="h-16 w-16 rounded-full bg-success-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success-600" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Password updated</h2>
              <p className="text-sm text-neutral-500">
                Your password has been changed. You can now sign in with your new password.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/login">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {effectiveStatus === "valid" && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>New password</CardTitle>
            <CardDescription>Enter and confirm your new password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    disabled={submitting}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={submitting}
                  autoComplete="new-password"
                />
              </div>

              <p className="text-xs text-neutral-500">Use at least 8 characters.</p>

              <Button type="submit" className="w-full" loading={submitting}>
                Reset password
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Link
              href="/login"
              className="mx-auto text-sm text-primary-600 font-medium hover:underline"
            >
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
