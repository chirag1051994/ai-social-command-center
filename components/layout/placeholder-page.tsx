import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholderPageProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PlaceholderPage({
  eyebrow,
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <main className="flex min-h-[calc(100vh-60px)] items-center justify-center p-6">
      <Card className="w-full max-w-3xl border border-white/8 bg-[#13131f]/90 shadow-[0_24px_80px_rgba(10,10,15,0.42)]">
        <CardHeader className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-primary/75">
            {eyebrow}
          </p>
          <CardTitle className="text-3xl font-semibold tracking-tight text-white">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="max-w-2xl text-sm leading-7 text-slate-400">{description}</p>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-500">
            Full workflow lands in Phase 5
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
