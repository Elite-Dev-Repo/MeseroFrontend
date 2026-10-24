"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Utensils, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
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

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password: string) => password.length >= 8;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters.");
      return;
    }
    if (!validateEmail(form.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
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
      await registerUser(form.name.trim(), form.email.trim(), form.password);
      toast.success("Verification code sent to your email.");
      router.push("/verify-email");
    } catch (err: any) {
      const message = err.response?.data?.detail || "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center">
            <Utensils className="h-7 w-7 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-neutral-900">Mesero</span>
        </Link>
        <h1 className="text-2xl font-display font-bold text-neutral-900">Create your account</h1>
        <p className="text-neutral-500 mt-2">Start managing your restaurant today</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Enter your details to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                disabled={submitting || isLoading}
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                disabled={submitting || isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  disabled={submitting || isLoading}
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
                disabled={submitting || isLoading}
                autoComplete="new-password"
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <Label htmlFor="terms" className="text-sm text-neutral-600">
                I agree to the{" "}
                <Link href="/terms" className="text-primary-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary-600 hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button type="submit" className="w-full" loading={submitting || isLoading}>
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-center text-sm text-neutral-600">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}