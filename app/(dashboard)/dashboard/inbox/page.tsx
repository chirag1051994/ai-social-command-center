"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";

import { EmptyInboxState, StateBlock } from "@/components/dashboard/state-block";
import { PlatformBadge } from "@/components/dashboard/platform-badge";
import { PagePanelSkeleton } from "@/components/dashboard/loading-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InboxMessage, MessageType, Platform } from "@/lib/types";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

const FILTERS: Array<{ label: string; value: "all" | MessageType | "unread" }> = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Mentions", value: "mention" },
  { label: "DMs", value: "dm" },
  { label: "Comments", value: "comment" },
];

export default function InboxPage() {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | MessageType | "unread">("all");
  const [activePlatform, setActivePlatform] = useState<Platform | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();

      if (activeFilter === "unread") {
        searchParams.set("is_read", "false");
      } else if (activeFilter !== "all") {
        searchParams.set("type", activeFilter);
      }

      if (activePlatform !== "all") {
        searchParams.set("platform", activePlatform);
      }

      const response = await fetch(`/api/inbox?${searchParams.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });
      const payload = (await response.json()) as ApiResponse<InboxMessage[]>;

      if (payload.error) {
        throw new Error(payload.error);
      }

      const nextMessages = payload.data ?? [];
      setMessages(nextMessages);
      setSelectedId((current) => current ?? nextMessages[0]?.id ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load inbox");
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, activePlatform]);

  async function markMessageRead(id: string) {
    const response = await fetch(`/api/inbox/${id}`, {
      method: "PATCH",
      credentials: "include",
    });
    const payload = (await response.json()) as ApiResponse<InboxMessage>;

    if (!payload.error) {
      setMessages((current) =>
        current.map((message) =>
          message.id === id && payload.data ? payload.data : message,
        ),
      );
    }
  }

  async function markAllRead() {
    const response = await fetch("/api/inbox", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ markAll: true }),
    });
    const payload = (await response.json()) as ApiResponse<null>;

    if (!payload.error) {
      void loadMessages();
    }
  }

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const selectedMessage = messages.find((message) => message.id === selectedId) ?? null;

  if (isLoading) {
    return (
      <main className="p-6">
        <PagePanelSkeleton rows={3} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <StateBlock
          actionLabel="Retry"
          description="The unified inbox could not load the latest messages. Retry to reconnect the conversation stream."
          onAction={() => void loadMessages()}
          title="Inbox unavailable"
          tone="error"
        />
      </main>
    );
  }

  if (messages.length === 0) {
    return (
      <main className="p-6">
        <EmptyInboxState />
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-60px)] flex-col gap-4 p-6 xl:flex-row">
      <section className="flex w-full flex-col rounded-3xl border border-white/8 bg-[#13131f]/80 xl:w-[380px]">
        <div className="border-b border-white/8 px-4 py-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <Button
                className={filter.value === activeFilter ? "bg-primary text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                size="sm"
                type="button"
                variant={filter.value === activeFilter ? "default" : "ghost"}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              className={activePlatform === "all" ? "bg-primary text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}
              onClick={() => setActivePlatform("all")}
              size="sm"
              type="button"
              variant={activePlatform === "all" ? "default" : "ghost"}
            >
              All Platforms
            </Button>
            {(["twitter", "instagram", "linkedin", "facebook"] as Platform[]).map((platform) => (
              <Button
                className={activePlatform === platform ? "bg-primary text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}
                key={platform}
                onClick={() => setActivePlatform(platform)}
                size="sm"
                type="button"
                variant={activePlatform === platform ? "default" : "ghost"}
              >
                {platform}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {messages.map((message) => (
            <button
              className={`w-full border-l-2 px-4 py-4 text-left transition ${
                selectedId === message.id
                  ? "border-primary bg-primary/10"
                  : message.is_read
                    ? "border-transparent hover:bg-white/4"
                    : "border-primary/70 bg-white/4 hover:bg-white/6"
              }`}
              key={message.id}
              onClick={() => {
                setSelectedId(message.id);
                if (!message.is_read) {
                  void markMessageRead(message.id);
                }
              }}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-sm ${message.is_read ? "text-slate-300" : "font-semibold text-white"}`}>
                    {message.sender_name}
                  </p>
                  <p className="text-xs text-slate-500">{message.sender_handle ?? "@"}</p>
                </div>
                <p className="text-xs text-slate-500">
                  {formatDistanceToNow(parseISO(message.received_at), { addSuffix: true })}
                </p>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-slate-400">{message.content}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="flex-1 rounded-3xl border border-white/8 bg-[#13131f]/80 p-6">
        {selectedMessage ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 border-b border-white/8 pb-6 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-white">{selectedMessage.sender_name}</h1>
                <p className="mt-2 text-sm text-slate-400">
                  {selectedMessage.sender_handle ?? "No handle"} ·{" "}
                  {formatDistanceToNow(parseISO(selectedMessage.received_at), { addSuffix: true })}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <PlatformBadge platform={selectedMessage.platform} />
                  {selectedMessage.sentiment ? (
                    <Badge className="bg-white/6 text-slate-300">{selectedMessage.sentiment}</Badge>
                  ) : null}
                  <Badge className="bg-white/6 text-slate-300">{selectedMessage.message_type}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {!selectedMessage.is_read ? (
                  <Button onClick={() => void markMessageRead(selectedMessage.id)} type="button" variant="outline">
                    Mark as Read
                  </Button>
                ) : null}
                <Button className="bg-primary text-white hover:bg-indigo-500" onClick={() => void markAllRead()} type="button">
                  Mark All Read
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-white/3 p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{selectedMessage.content}</p>
            </div>

            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-5">
              <p className="text-sm font-medium text-white">Reply</p>
              <p className="mt-2 text-sm text-slate-500">
                Reply actions are UI-only in this phase. Message state and read workflows are already live.
              </p>
            </div>
          </div>
        ) : (
          <StateBlock description="Pick a conversation from the left to inspect the full message." title="Select a message" />
        )}
      </section>
    </main>
  );
}
