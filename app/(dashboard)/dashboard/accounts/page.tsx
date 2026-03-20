"use client";

import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";

import { PlatformBadge } from "@/components/dashboard/platform-badge";
import { PagePanelSkeleton } from "@/components/dashboard/loading-grid";
import { StateBlock } from "@/components/dashboard/state-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ALL_PLATFORMS, PLATFORM_LABELS, formatCompactNumber } from "@/lib/platforms";
import type { Platform, SocialAccount } from "@/lib/types";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [accountName, setAccountName] = useState("");
  const [accountHandle, setAccountHandle] = useState("");
  const [followersCount, setFollowersCount] = useState("0");

  async function loadAccounts() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/social-accounts", {
        cache: "no-store",
        credentials: "include",
      });
      const payload = (await response.json()) as ApiResponse<SocialAccount[]>;

      if (payload.error) {
        throw new Error(payload.error);
      }

      setAccounts(payload.data ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load accounts");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConnect() {
    if (!selectedPlatform) {
      return;
    }

    const response = await fetch("/api/social-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        platform: selectedPlatform,
        account_name: accountName,
        account_handle: accountHandle,
        followers_count: Number.isFinite(Number(followersCount))
          ? Number(followersCount)
          : 0,
      }),
    });

    const payload = (await response.json()) as ApiResponse<SocialAccount>;

    if (payload.error) {
      setError(payload.error);
      return;
    }

    setIsDialogOpen(false);
    setSelectedPlatform(null);
    setAccountName("");
    setAccountHandle("");
    setFollowersCount("0");
    void loadAccounts();
  }

  async function handleDelete(id: string) {
    const response = await fetch(`/api/social-accounts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const payload = (await response.json()) as ApiResponse<null>;

    if (payload.error) {
      setError(payload.error);
      return;
    }

    void loadAccounts();
  }

  useEffect(() => {
    void loadAccounts();
  }, []);

  if (isLoading) {
    return (
      <main className="space-y-6 p-6">
        <PagePanelSkeleton rows={3} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <StateBlock
          actionLabel="Retry"
          description="PhootSuite could not load your connected channels. Retry the request to restore the accounts workspace."
          onAction={() => void loadAccounts()}
          title="Accounts unavailable"
          tone="error"
        />
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Connections</p>
          <h1 className="text-2xl font-semibold text-white">Social Accounts</h1>
          <p className="mt-2 text-sm text-slate-400">{accounts.length} connected account(s)</p>
        </div>
        <Button className="bg-primary text-white hover:bg-indigo-500" onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Connect Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <StateBlock
          description="Connect your first channel to unlock publishing, analytics, and unified inbox workflows."
          title="No social accounts connected"
        />
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {accounts.map((account) => (
            <div
              className="rounded-3xl border border-white/8 bg-[#13131f]/80 p-6"
              key={account.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <PlatformBadge platform={account.platform} />
                  <h2 className="mt-4 text-xl font-semibold text-white">{account.account_name}</h2>
                  <p className="mt-1 text-sm text-slate-400">@{account.account_handle}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-3">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Followers</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {formatCompactNumber(account.followers_count)}
                  </p>
                </div>
                <Badge className={account.is_connected ? "bg-emerald-400/15 text-emerald-300" : "bg-white/8 text-slate-400"}>
                  {account.is_connected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <div className="mt-6">
                <Button
                  className="w-full border-white/10 text-white hover:bg-white/8"
                  onClick={() => void handleDelete(account.id)}
                  variant="outline"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ))}
        </section>
      )}

      <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
        <DialogContent className="max-w-xl border border-white/8 bg-[#13131f] text-white">
          <DialogHeader>
            <DialogTitle>Connect new account</DialogTitle>
            <DialogDescription>
              OAuth integration comes later. For now, add the account details manually to power the workflow.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            {ALL_PLATFORMS.map((platform) => (
              <button
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  selectedPlatform === platform
                    ? "border-primary bg-primary/10 text-white"
                    : "border-white/8 bg-white/4 text-slate-300 hover:border-white/16"
                }`}
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                type="button"
              >
                {PLATFORM_LABELS[platform]}
              </button>
            ))}
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="account-name">Account Name</Label>
              <Input
                id="account-name"
                className="border-white/10 bg-white/5 text-white"
                onChange={(event) => setAccountName(event.target.value)}
                value={accountName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-handle">Handle</Label>
              <Input
                id="account-handle"
                className="border-white/10 bg-white/5 text-white"
                onChange={(event) => setAccountHandle(event.target.value)}
                value={accountHandle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followers-count">Followers</Label>
              <Input
                id="followers-count"
                className="border-white/10 bg-white/5 text-white"
                onChange={(event) => setFollowersCount(event.target.value)}
                type="number"
                value={followersCount}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} type="button" variant="ghost">
              Cancel
            </Button>
            <Button
              className="bg-primary text-white hover:bg-indigo-500"
              disabled={!selectedPlatform || !accountName.trim() || !accountHandle.trim()}
              onClick={() => void handleConnect()}
              type="button"
            >
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
