"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardCardsSkeleton, PagePanelSkeleton } from "@/components/dashboard/loading-grid";
import { StateBlock } from "@/components/dashboard/state-block";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLATFORM_COLORS, formatCompactNumber } from "@/lib/platforms";
import type { AnalyticsSummary } from "@/lib/types";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export default function AnalyticsPage() {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/summary?days=${days}`, {
        cache: "no-store",
        credentials: "include",
      });
      const payload = (await response.json()) as ApiResponse<AnalyticsSummary>;

      if (payload.error || !payload.data) {
        throw new Error(payload.error ?? "Failed to load analytics");
      }

      setSummary(payload.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  if (isLoading) {
    return (
      <main className="space-y-6 p-6">
        <DashboardCardsSkeleton />
        <PagePanelSkeleton rows={3} />
      </main>
    );
  }

  if (error || !summary) {
    return (
      <main className="p-6">
        <StateBlock
          actionLabel="Retry"
          description="The analytics summary could not load for this date window."
          onAction={() => void loadSummary()}
          title="Analytics unavailable"
          tone="error"
        />
      </main>
    );
  }

  const metricCards = [
    { label: "Impressions", value: formatCompactNumber(summary.totalImpressions) },
    { label: "Reach", value: formatCompactNumber(summary.totalReach) },
    { label: "Engagements", value: formatCompactNumber(summary.totalEngagements) },
    { label: "Avg Engagement", value: `${summary.avgEngagementRate}%` },
  ];

  const topPostsChart = summary.topPosts.map((post) => ({
    name: post.content.slice(0, 24),
    engagement:
      post.analytics.reduce((sum, item) => sum + item.engagement_rate, 0) /
      post.analytics.length,
  }));

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap gap-2">
        {[7, 30, 90].map((window) => (
          <Button
            key={window}
            onClick={() => setDays(window as 7 | 30 | 90)}
            size="sm"
            type="button"
            variant={days === window ? "default" : "ghost"}
          >
            {window}D
          </Button>
        ))}
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <Card className="border border-white/8 bg-[#13131f]/80" key={metric.label}>
            <CardContent className="space-y-2 py-6">
              <p className="text-sm text-slate-400">{metric.label}</p>
              <p className="text-3xl font-semibold text-white">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border border-white/8 bg-[#13131f]/80">
          <CardHeader>
            <CardTitle className="text-white">Impressions Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={summary.dailyImpressions}>
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    background: "#13131f",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                />
                <Line dataKey="impressions" stroke="#6366f1" strokeWidth={3} type="monotone" />
                <Line dataKey="reach" stroke="#f59e0b" strokeWidth={2} type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border border-white/8 bg-[#13131f]/80">
            <CardHeader>
              <CardTitle className="text-white">Platform Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-[220px]">
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie data={summary.platformBreakdown} dataKey="percentage" innerRadius={55} outerRadius={80}>
                    {summary.platformBreakdown.map((entry) => (
                      <Cell fill={PLATFORM_COLORS[entry.platform]} key={entry.platform} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#13131f",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-white/8 bg-[#13131f]/80">
            <CardHeader>
              <CardTitle className="text-white">Top Posts</CardTitle>
            </CardHeader>
            <CardContent className="h-[220px]">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={topPostsChart}>
                  <XAxis dataKey="name" hide />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      background: "#13131f",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  />
                  <Bar dataKey="engagement" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="border border-white/8 bg-[#13131f]/80">
        <CardHeader>
          <CardTitle className="text-white">Top Post Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="pb-4">Content</th>
                  <th className="pb-4">Platforms</th>
                  <th className="pb-4">Avg Eng Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {summary.topPosts.map((post) => (
                  <tr key={post.id}>
                    <td className="py-4 text-white">
                      {post.content.length > 80 ? `${post.content.slice(0, 80)}...` : post.content}
                    </td>
                    <td className="py-4 text-slate-400">{post.platforms.join(", ")}</td>
                    <td className="py-4 text-slate-300">
                      {(
                        post.analytics.reduce((sum, item) => sum + item.engagement_rate, 0) /
                        post.analytics.length
                      ).toFixed(2)}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
