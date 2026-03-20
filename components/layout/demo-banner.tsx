"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const DISMISS_KEY = "phootsuite-demo-banner-dismissed";

interface DemoBannerProps {
  isDemoUser: boolean;
}

export function DemoBanner({ isDemoUser }: DemoBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (!isDemoUser) {
      setIsDismissed(true);
      return;
    }

    setIsDismissed(window.sessionStorage.getItem(DISMISS_KEY) === "true");
  }, [isDemoUser]);

  if (!isDemoUser || isDismissed) {
    return null;
  }

  return (
    <div className="border-b border-amber-400/20 bg-amber-400/8 px-4 py-3 md:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-amber-100">
          <span className="font-semibold">You&apos;re in demo mode.</span>{" "}
          Explore freely and sign up to connect your real accounts.
        </p>
        <Button
          className="border-amber-300/20 bg-transparent text-amber-100 hover:bg-amber-300/10 hover:text-white"
          onClick={() => {
            window.sessionStorage.setItem(DISMISS_KEY, "true");
            setIsDismissed(true);
          }}
          size="sm"
          type="button"
          variant="outline"
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}
