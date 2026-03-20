"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, EyeOff, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  function handleGoogleSignIn() {
    startTransition(async () => {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) {
        toast.error(error.message);
      }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <Card className="border-white/10 bg-[#13131f]/90 shadow-[0_30px_80px_rgba(10,10,15,0.55)] backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-primary/70">
              PhootSuite
            </p>
            <CardTitle className="text-4xl font-semibold tracking-tight text-white">
              <span className="bg-gradient-to-r from-indigo-400 via-indigo-200 to-violet-300 bg-clip-text text-transparent">
                Your social media,
              </span>
              <br />
              commanded.
            </CardTitle>
          </div>
          <p className="text-sm leading-6 text-slate-400">
            Sign in to schedule, analyze, and manage every channel from one command center.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="email"
                  autoComplete="email"
                  className="h-12 border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@agency.com"
                  required
                  type="email"
                  value={email}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  className="text-xs font-medium text-slate-400 transition hover:text-primary"
                  href="#"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  autoComplete="current-password"
                  className="h-12 border-white/10 bg-white/5 pr-12 text-white placeholder:text-slate-500"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
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
            </div>

            <Button
              className="h-12 w-full bg-gradient-to-r from-primary to-indigo-500 text-white hover:from-indigo-500 hover:to-primary"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
            <div className="h-px flex-1 bg-white/10" />
            <span>or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <Button
            className="h-12 w-full border border-white/10 bg-transparent text-white hover:bg-white/5"
            disabled={isPending}
            onClick={handleGoogleSignIn}
            type="button"
            variant="outline"
          >
            <span className="mr-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-black text-xs font-semibold">
              G
            </span>
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-slate-400">
            No account?{" "}
            <Link className="font-medium text-primary transition hover:text-indigo-300" href="/signup">
              Sign up →
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
