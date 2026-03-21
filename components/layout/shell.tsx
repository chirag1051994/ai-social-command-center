import type { Plan } from "@/lib/types";

export type NavigationIcon =
  | "dashboard"
  | "compose"
  | "calendar"
  | "analytics"
  | "inbox"
  | "accounts";

export interface NavigationItem {
  title: string;
  href: string;
  icon: NavigationIcon;
}

export interface DashboardShellUser {
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  plan: Plan;
}

export function getUserDisplayName(user: DashboardShellUser): string {
  if (user.fullName) {
    return user.fullName;
  }

  return user.email.split("@")[0] ?? "Workspace User";
}

export function getUserInitials(name: string): string {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "PS";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}
