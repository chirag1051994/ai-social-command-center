"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, PenSquare } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import type {
  DashboardShellUser,
  NavigationItem,
} from "@/components/layout/shell";

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/compose": "Compose",
    "/dashboard/calendar": "Calendar",
    "/dashboard/analytics": "Analytics",
    "/dashboard/inbox": "Inbox",
    "/dashboard/accounts": "Accounts",
  };

  return titles[pathname] ?? "Dashboard";
}

interface TopBarProps {
  navigation: NavigationItem[];
  user: DashboardShellUser;
}

export function TopBar({ navigation, user }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-white/8 bg-[rgba(10,10,15,0.82)] px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <Sheet onOpenChange={setIsMobileNavOpen} open={isMobileNavOpen}>
            <SheetTrigger
              render={
                <Button
                  aria-label="Open navigation"
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                  size="icon-sm"
                  variant="outline"
                />
              }
            >
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent
              className="w-[280px] border-r border-white/8 bg-[#0d0d1a] p-0"
              side="left"
              showCloseButton={false}
            >
              <SheetHeader className="sr-only">
                <SheetTitle>PhootSuite navigation</SheetTitle>
                <SheetDescription>Open dashboard navigation for small screens.</SheetDescription>
              </SheetHeader>
              <Sidebar
                navigation={navigation}
                onNavigate={() => setIsMobileNavOpen(false)}
                user={user}
              />
            </SheetContent>
          </Sheet>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Agency Ops</p>
          <h1 className="text-lg font-semibold tracking-tight text-white">
            {getPageTitle(pathname)}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          aria-label="Notifications"
          className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <Bell className="h-4 w-4" />
        </Button>
        <Button
          className="bg-primary text-white hover:bg-indigo-500"
          onClick={() => router.push("/dashboard/compose")}
          type="button"
        >
          <PenSquare className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">New Post</span>
          <span className="sm:hidden">Post</span>
        </Button>
      </div>
    </header>
  );
}
