import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  MessageSquare,
  PenSquare,
  Share2,
} from "lucide-react";
import { redirect } from "next/navigation";

import { DemoBanner } from "@/components/layout/demo-banner";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import type {
  DashboardShellUser,
  NavigationItem,
} from "@/components/layout/shell";
import { getProfile } from "@/lib/services/profile.service";
import { createClient } from "@/lib/supabase/server";

const navigation: NavigationItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Compose", href: "/dashboard/compose", icon: PenSquare },
  { title: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { title: "Inbox", href: "/dashboard/inbox", icon: MessageSquare },
  { title: "Accounts", href: "/dashboard/accounts", icon: Share2 },
];

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profileResult = await getProfile(user.id);
  const shellUser: DashboardShellUser = {
    email: user.email ?? "workspace@phootsuite.app",
    fullName: profileResult.data?.full_name ?? null,
    avatarUrl: profileResult.data?.avatar_url ?? null,
    plan: profileResult.data?.plan ?? "starter",
  };
  const isDemoUser =
    user.email === "demo@phootsuite.com" ||
    profileResult.data?.company_name === "Brandify Agency";

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:block md:w-[240px]">
        <Sidebar navigation={navigation} user={shellUser} />
      </div>
      <div className="md:pl-[240px]">
        <TopBar navigation={navigation} user={shellUser} />
        <DemoBanner isDemoUser={isDemoUser} />
        <div className="min-h-[calc(100vh-60px)]">{children}</div>
      </div>
    </div>
  );
}
