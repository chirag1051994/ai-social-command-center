import { Badge } from "@/components/ui/badge";
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/lib/platforms";
import type { Platform } from "@/lib/types";

interface PlatformBadgeProps {
  platform: Platform;
}

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  return (
    <Badge
      className="border-none text-[11px] font-semibold"
      style={{
        backgroundColor: `${PLATFORM_COLORS[platform]}22`,
        color: PLATFORM_COLORS[platform],
      }}
      variant="secondary"
    >
      {PLATFORM_LABELS[platform]}
    </Badge>
  );
}
