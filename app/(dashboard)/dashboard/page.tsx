"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BarChart3, CalendarDays, MessageSquare, PenSquare, Radio } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

import { DashboardCardsSkeleton, PagePanelSkeleton } from "@/components/dashboard/loading-grid";
import { PlatformBadge } from "@/components/dashboard/platform-badge";
import { StateBlock } from "@/components/dashboard/state-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactNumber } from "@/lib/platforms";
import type { DashboardStats, Post } from "@/lib/types";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

interface DashboardPayload {
  stats: DashboardStats;
  scheduled: Post[];
  published: Post[];
}

const QUICK_ACTIONS = [
  {
    title: "Compose Post",
    href: "/dashboard/compose",
    icon: PenSquare,
    description: "Write, refine, and schedule your next cross-platform post.",
  },
  {
    title: "View Calendar",
    href: "/dashboard/calendar",
    icon: CalendarDays,
    description: "Inspect upcoming publishes and reschedule the week quickly.",
  },
  {
    title: "View Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "See what is lifting reach, engagement, and team momentum.",
  },
];

export default function DashboardHomePage() {
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsResponse, scheduledResponse, publishedResponse] = await Promise.all([
        fetch("/api/dashboard/stats", { cache: "no-store", credentials: "include" }),
        fetch("/api/posts?status=scheduled&limit=5", { cache: "no-store", credentials: "include" }),
        fetch("/api/posts?status=published&limit=5", { cache: "no-store", credentials: "include" }),
      ]);

      const statsPayload = (await statsResponse.json()) as ApiResponse<DashboardStats>;
      const scheduledPayload = (await scheduledResponse.json()) as ApiResponse<Post[]>;
      const publishedPayload = (await publishedResponse.json()) as ApiResponse<Post[]>;

      if (statsPayload.error || scheduledPayload.error || publishedPayload.error) {
        throw new Error(
          statsPayload.error ?? scheduledPayload.error ?? publishedPayload.error ?? "Failed to load dashboard",
        );
      }

      if (!statsPayload.data) {
        throw new Error("Dashboard stats are unavailable");
      }

      setPayload({
        stats: statsPayload.data,
        scheduled: scheduledPayload.data ?? [],
        published: publishedPayload.data ?? [],
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (isLoading) {
    return (
      <main className="space-y-6 p-6">
        <DashboardCardsSkeleton />
        <PagePanelSkeleton rows={2} />
      </main>
    );
  }

  if (error || !payload) {
    return (
      <main className="p-6">
        <StateBlock
          actionLabel="Retry"
          description="The command center could not load the latest account metrics. Retry the dashboard request to continue."
          onAction={() => void loadDashboard()}
          title="Dashboard unavailable"
          tone="error"
        />
      </main>
    );
  }

  const statsCards = [
    { label: "Total Posts", value: payload.stats.totalPosts, icon: Radio, accent: "text-primary" },
    {
      label: "Scheduled",
      value: payload.stats.scheduledPosts,
      icon: CalendarDays,
      accent: "text-amber-300",
    },
    {
      label: "Published",
      value: payload.stats.publishedPosts,
      icon: MessageSquare,
      accent: "text-emerald-300",
    },
    {
      label: "Total Reach",
      value: formatCompactNumber(payload.stats.totalReach),
      icon: BarChart3,
      accent: "text-sky-300",
    },
  ];

  return (
    <main className="space-y-6 p-6">
      {payload.stats.connectedAccounts === 0 ? (
        <Card className="border border-amber-400/20 bg-amber-400/8">
          <CardContent className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-amber-300">
                Get Started
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Connect your first social account to bring the workspace to life.
              </h2>
            </div>
            <Link href="/dashboard/accounts">
              <Button className="bg-amber-400 text-slate-950 hover:bg-amber-300">
                Connect accounts
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card className="border border-white/8 bg-[#13131f]/80" key={card.label}>
              <CardContent className="space-y-4 py-6">
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <Icon className={`h-5 w-5 ${card.accent}`} />
                  </div>
                  <Badge className="bg-white/5 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                    Live
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="border border-white/8 bg-[#13131f]/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Recent Scheduled Posts</CardTitle>
            <Link href="/dashboard/calendar">
              <Button size="sm" variant="ghost">
                Open calendar
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {payload.scheduled.length === 0 ? (
              <StateBlock
                description="Scheduled posts will appear here as soon as your team starts queueing content."
                title="Nothing scheduled yet"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="pb-4">Content</th>
                      <th className="pb-4">Platforms</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4 text-right">Scheduled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/6">
                    {payload.scheduled.map((post) => (
                      <tr key={post.id}>
                        <td className="py-4 pr-4 text-white">
                          {post.content.length > 60 ? `${post.content.slice(0, 60)}...` : post.content}
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-2">
                            {post.platforms.map((platform) => (
                              <PlatformBadge key={`${post.id}-${platform}`} platform={platform} />
                            ))}
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge className="bg-primary/15 text-primary">{post.status}</Badge>
                        </td>
                        <td className="py-4 text-right text-slate-400">
                          {post.scheduled_at
                            ? formatDistanceToNow(parseISO(post.scheduled_at), { addSuffix: true })
                            : "Not scheduled"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link href={action.href} key={action.href}>
                <Card className="border border-white/8 bg-[#13131f]/80 transition hover:border-primary/30 hover:bg-[#17172a]">
                  <CardContent className="flex items-start gap-4 py-6">
                    <div className="rounded-2xl bg-primary/10 p-3">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{action.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
