import { Skeleton } from "@/components/ui/skeleton";

export function DashboardCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton className="h-32 rounded-3xl bg-white/5" key={index} />
      ))}
    </div>
  );
}

export function PagePanelSkeleton({ rows = 1 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton className="h-28 rounded-3xl bg-white/5" key={index} />
      ))}
    </div>
  );
}
