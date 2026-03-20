"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";

interface InboxResponse {
  data: Array<unknown> | null;
  error: string | null;
}

export function UnreadBadge() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let isActive = true;

    async function loadUnreadCount() {
      try {
        const response = await fetch("/api/inbox?is_read=false", {
          cache: "no-store",
          credentials: "include",
        });
        const payload = (await response.json()) as InboxResponse;

        if (isActive && Array.isArray(payload.data)) {
          setCount(payload.data.length);
        }
      } catch {
        if (isActive) {
          setCount(0);
        }
      }
    }

    void loadUnreadCount();
    const intervalId = window.setInterval(() => {
      void loadUnreadCount();
    }, 60000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, []);

  if (count === 0) {
    return null;
  }

  return (
    <Badge className="min-w-5 justify-center rounded-full bg-primary/20 px-1.5 text-[10px] font-semibold text-primary">
      {count}
    </Badge>
  );
}
