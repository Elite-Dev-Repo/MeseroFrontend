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

interface LoginForm {
  email: string;
  password: string;
}

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateEmail(form.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!form.password) {
      toast.error("Password is required.");
      return;
    }

    setSubmitting(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      const message = err.response?.data?.detail || "Invalid email or password";
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
          <span className="font-display font-bold text-2xl text-neutral-900">
            Mesero
          </span>
        </Link>
        <h1 className="text-2xl font-display font-bold text-neutral-900">
          Welcome back
        </h1>
        <p className="text-neutral-500 mt-2">Sign in to manage your restaurant</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-600">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={submitting || isLoading}
            >
              Sign in
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-center text-sm text-neutral-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-primary-600 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
