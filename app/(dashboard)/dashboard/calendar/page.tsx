"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

import { PagePanelSkeleton } from "@/components/dashboard/loading-grid";
import { PlatformBadge } from "@/components/dashboard/platform-badge";
import { StateBlock } from "@/components/dashboard/state-block";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ALL_PLATFORMS, PLATFORM_COLORS } from "@/lib/platforms";
import type { Platform, Post } from "@/lib/types";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

function buildCalendarDays(currentMonth: Date): Date[] {
  const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
  const days: Date[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<"month" | "list">("month");
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const start = startOfMonth(currentMonth).toISOString();
      const end = endOfMonth(currentMonth).toISOString();
      const response = await fetch(
        `/api/posts/calendar?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
        {
          cache: "no-store",
          credentials: "include",
        },
      );
      const payload = (await response.json()) as ApiResponse<Post[]>;

      if (payload.error) {
        throw new Error(payload.error);
      }

      setPosts(payload.data ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load calendar");
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const visiblePosts =
    platformFilter === "all"
      ? posts
      : posts.filter((post) => post.platforms.includes(platformFilter));

  if (isLoading) {
    return (
      <main className="p-6">
        <PagePanelSkeleton rows={4} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <StateBlock
          actionLabel="Retry"
          description="The publishing calendar could not load this month’s schedule."
          onAction={() => void loadPosts()}
          title="Calendar unavailable"
          tone="error"
        />
      </main>
    );
  }

  if (visiblePosts.length === 0) {
    return (
      <main className="p-6">
        <StateBlock
          description="No scheduled or published posts exist in this time window yet. Once the team adds scheduled content, the calendar will populate automatically."
          title="No posts in this month"
        />
      </main>
    );
  }

  const days = buildCalendarDays(currentMonth);

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={() => setCurrentMonth((current) => subMonths(current, 1))} type="button" variant="outline">
            Prev
          </Button>
          <div className="rounded-2xl border border-white/8 bg-[#13131f]/80 px-4 py-2 text-white">
            {format(currentMonth, "MMMM yyyy")}
          </div>
          <Button onClick={() => setCurrentMonth((current) => addMonths(current, 1))} type="button" variant="outline">
            Next
          </Button>
          <Button onClick={() => setCurrentMonth(new Date())} type="button" variant="ghost">
            Today
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setView("month")} size="sm" type="button" variant={view === "month" ? "default" : "ghost"}>
            Month
          </Button>
          <Button onClick={() => setView("list")} size="sm" type="button" variant={view === "list" ? "default" : "ghost"}>
            List
          </Button>
          <Button onClick={() => setPlatformFilter("all")} size="sm" type="button" variant={platformFilter === "all" ? "default" : "ghost"}>
            All
          </Button>
          {ALL_PLATFORMS.map((platform) => (
            <Button
              key={platform}
              onClick={() => setPlatformFilter(platform)}
              size="sm"
              type="button"
              variant={platformFilter === platform ? "default" : "ghost"}
            >
              {platform}
            </Button>
          ))}
        </div>
      </div>

      {view === "month" ? (
        <section className="grid grid-cols-7 gap-3">
          {days.map((day) => {
            const dayPosts = visiblePosts.filter((post) => {
              if (!post.scheduled_at) {
                return false;
              }

              const scheduled = parseISO(post.scheduled_at);
              return format(scheduled, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
            });

            return (
              <div
                className={`min-h-[160px] rounded-3xl border p-3 ${
                  isSameMonth(day, currentMonth)
                    ? "border-white/8 bg-[#13131f]/80"
                    : "border-white/6 bg-white/[0.02] opacity-60"
                } ${isToday(day) ? "ring-1 ring-primary" : ""}`}
                key={day.toISOString()}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{format(day, "d")}</span>
                  {dayPosts.length > 0 ? (
                    <span className="rounded-full bg-white/6 px-2 py-0.5 text-[10px] text-slate-400">
                      {dayPosts.length}
                    </span>
                  ) : null}
                </div>

                <div className="space-y-2">
                  {dayPosts.slice(0, 3).map((post) => (
                    <Popover key={post.id}>
                      <PopoverTrigger
                        className="w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-white"
                        style={{
                          backgroundColor: `${PLATFORM_COLORS[post.platforms[0] ?? "twitter"]}22`,
                        }}
                      >
                        {post.content.length > 40 ? `${post.content.slice(0, 40)}...` : post.content}
                      </PopoverTrigger>
                      <PopoverContent className="border border-white/8 bg-[#13131f] text-white">
                        <PopoverHeader>
                          <PopoverTitle>Scheduled Post</PopoverTitle>
                          <PopoverDescription>
                            {post.scheduled_at ? format(parseISO(post.scheduled_at), "PPP p") : "No schedule"}
                          </PopoverDescription>
                        </PopoverHeader>
                        <p className="text-sm leading-6 text-slate-300">{post.content}</p>
                      </PopoverContent>
                    </Popover>
                  ))}
                  {dayPosts.length > 3 ? (
                    <p className="text-xs text-slate-500">+{dayPosts.length - 3} more</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <section className="space-y-3">
          {visiblePosts
            .slice()
            .sort((left, right) =>
              (left.scheduled_at ?? "").localeCompare(right.scheduled_at ?? ""),
            )
            .map((post) => (
              <div
                className="rounded-3xl border border-white/8 bg-[#13131f]/80 p-4"
                key={post.id}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {post.platforms.map((platform) => (
                        <PlatformBadge key={`${post.id}-${platform}`} platform={platform} />
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-slate-300">{post.content}</p>
                  </div>
                  <div className="text-sm text-slate-500">
                    {post.scheduled_at ? format(parseISO(post.scheduled_at), "PPP p") : "No schedule"}
                  </div>
                </div>
              </div>
            ))}
        </section>
      )}
    </main>
  );
}
