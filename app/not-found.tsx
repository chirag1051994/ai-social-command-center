import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <Card className="w-full max-w-xl border border-white/8 bg-[#13131f]/90 text-center shadow-[0_24px_80px_rgba(10,10,15,0.5)]">
        <CardHeader className="space-y-3">
          <p className="text-xs uppercase tracking-[0.32em] text-primary/70">404</p>
          <CardTitle className="text-4xl font-semibold text-white">
            That route is off the calendar.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm leading-7 text-slate-400">
            The page you requested is not part of the current command center. Head back to the dashboard to continue.
          </p>
          <Link href="/dashboard">
            <Button className="bg-primary text-white hover:bg-indigo-500">Go to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
