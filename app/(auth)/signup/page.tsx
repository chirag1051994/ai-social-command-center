"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

function calculatePasswordStrength(password: string): number {
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }

  if (/\d/.test(password)) {
    score += 1;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  return score;
}

function passwordStrengthLabel(score: number): string {
  if (score <= 1) {
    return "Weak";
  }

  if (score === 2) {
    return "Good";
  }

  return "Strong";
}

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const strength = calculatePasswordStrength(password);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName.trim(),
            company_name: company.trim(),
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <Card className="border-white/10 bg-[#13131f]/90 shadow-[0_30px_80px_rgba(10,10,15,0.55)] backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-accent/80">
              PhootSuite
            </p>
            <CardTitle className="text-4xl font-semibold tracking-tight text-white">
              <span className="bg-gradient-to-r from-amber-300 via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                Launch your command center.
              </span>
            </CardTitle>
          </div>
          <p className="text-sm leading-6 text-slate-400">
            Create your workspace and start managing every channel with one operating system.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                className="h-12 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Alex Johnson"
                required
                value={fullName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                className="h-12 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                onChange={(event) => setCompany(event.target.value)}
                placeholder="Brandify Agency"
                value={company}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                autoComplete="email"
                className="h-12 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@agency.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  autoComplete="new-password"
                  className="h-12 border-white/10 bg-white/5 pr-12 text-white placeholder:text-slate-500"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a secure password"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-200"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div
                    className={`h-2 flex-1 rounded-full ${strength >= 1 ? "bg-red-400" : "bg-white/10"}`}
                  />
                  <div
                    className={`h-2 flex-1 rounded-full ${strength >= 2 ? "bg-amber-400" : "bg-white/10"}`}
                  />
                  <div
                    className={`h-2 flex-1 rounded-full ${strength >= 3 ? "bg-emerald-400" : "bg-white/10"}`}
                  />
                </div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  {passwordStrengthLabel(strength)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  autoComplete="new-password"
                  className="h-12 border-white/10 bg-white/5 pr-12 text-white placeholder:text-slate-500"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                />
                <button
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-200"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  type="button"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              className="h-12 w-full bg-gradient-to-r from-primary via-indigo-500 to-amber-400 text-white hover:from-indigo-500 hover:to-amber-300"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link className="font-medium text-primary transition hover:text-indigo-300" href="/login">
              Sign in →
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
