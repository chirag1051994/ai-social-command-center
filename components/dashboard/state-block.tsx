import { AlertTriangle, Inbox, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

interface StateBlockProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "empty" | "error";
}

export function StateBlock({
  title,
  description,
  actionLabel,
  onAction,
  tone = "empty",
}: StateBlockProps) {
  const Icon = tone === "error" ? AlertTriangle : Sparkles;

  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-white/8 bg-[#13131f]/80 px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
        <Icon className={tone === "error" ? "h-6 w-6 text-red-400" : "h-6 w-6 text-primary"} />
      </div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-6 bg-primary text-white hover:bg-indigo-500" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyInboxState() {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-3xl border border-white/8 bg-[#13131f]/80 px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
        <Inbox className="h-6 w-6 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-white">No conversations yet</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
        When comments, mentions, and DMs arrive from connected channels, they will appear here.
      </p>
    </div>
  );
}
