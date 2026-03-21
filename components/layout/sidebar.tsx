"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PenSquare,
  Share2,
} from "lucide-react";
import { useTransition } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hasSupabaseEnv } from "@/lib/env";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  getUserDisplayName,
  getUserInitials,
  type DashboardShellUser,
  type NavigationItem,
} from "@/components/layout/shell";
import { UnreadBadge } from "@/components/layout/unread-badge";

const NAVIGATION_ICONS = {
  dashboard: LayoutDashboard,
  compose: PenSquare,
  calendar: CalendarDays,
  analytics: BarChart3,
  inbox: MessageSquare,
  accounts: Share2,
};

interface SidebarProps {
  navigation: NavigationItem[];
  user: DashboardShellUser;
  onNavigate?: () => void;
}

export function Sidebar({ navigation, user, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(displayName);
  const isSupabaseConfigured = hasSupabaseEnv();

  function handleLogout() {
    if (!isSupabaseConfigured) {
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (!error) {
        router.push("/login");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex h-full flex-col border-r border-white/8 bg-[#0d0d1a]">
      <div className="border-b border-white/8 px-5 py-6">
        <Link className="flex items-center gap-3" href="/dashboard" onClick={onNavigate}>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-indigo-400 to-amber-300 shadow-[0_12px_30px_rgba(99,102,241,0.35)]">
            <span className="text-lg font-semibold text-slate-950">P</span>
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-white">PhootSuite</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Command Center
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = NAVIGATION_ICONS[item.icon];

          return (
            <Link
              className={cn(
                "flex items-center justify-between rounded-xl border-l-[3px] border-transparent px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/4 hover:text-white",
                isActive &&
                  "border-primary bg-primary/10 text-white shadow-[inset_0_0_0_1px_rgba(99,102,241,0.18)]",
              )}
              href={item.href}
              key={item.href}
              onClick={onNavigate}
            >
              <span className="flex items-center gap-3">
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-slate-500")} />
                {item.title}
              </span>
              {item.href === "/dashboard/inbox" ? <UnreadBadge /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/8 px-4 py-4">
        <div className="rounded-2xl border border-white/8 bg-white/4 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-11 bg-primary/10" size="lg">
              {user.avatarUrl ? <AvatarImage alt={displayName} src={user.avatarUrl} /> : null}
              <AvatarFallback className="bg-primary/15 font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
            <Badge className="bg-amber-400/15 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">
              {user.plan}
            </Badge>
          </div>

          <Button
            className="mt-4 w-full justify-start bg-white/5 text-slate-200 hover:bg-white/8 hover:text-white"
            disabled={isPending || !isSupabaseConfigured}
            onClick={handleLogout}
            type="button"
            variant="ghost"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
