import type { Platform } from "@/lib/types";

export const PLATFORM_LABELS: Record<Platform, string> = {
  twitter: "Twitter/X",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  tiktok: "TikTok",
  pinterest: "Pinterest",
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  twitter: "#1a8cd8",
  instagram: "#e1306c",
  linkedin: "#0a66c2",
  facebook: "#1877f2",
  tiktok: "#ff0050",
  pinterest: "#e60023",
};

export const PLATFORM_CHARACTER_LIMITS: Record<Platform, number> = {
  twitter: 280,
  instagram: 2200,
  linkedin: 3000,
  facebook: 63206,
  tiktok: 2200,
  pinterest: 500,
};

export const ALL_PLATFORMS = Object.keys(PLATFORM_LABELS) as Platform[];

export function getPrimaryCharacterLimit(platforms: Platform[]): number {
  if (platforms.length === 0) {
    return PLATFORM_CHARACTER_LIMITS.twitter;
  }

  return Math.min(...platforms.map((platform) => PLATFORM_CHARACTER_LIMITS[platform]));
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}
