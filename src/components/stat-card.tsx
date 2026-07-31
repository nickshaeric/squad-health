import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  /**
   * Sub-label. Where the value is an average, this should state the
   * sample size: an average recovery time computed from four episodes
   * is not a number anyone should act on without knowing that.
   */
  detail?: string;
  icon?: LucideIcon;
  tone?: "default" | "warning" | "critical";
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-1">
          <p className="text-muted-foreground text-sm font-medium">
            {label}
          </p>
          <p
            className={cn(
              "text-3xl font-semibold tabular-nums tracking-tight",
              tone === "warning" && "text-severity-moderate",
              tone === "critical" && "text-severity-severe",
            )}
          >
            {value}
          </p>
          {detail ? (
            <p className="text-muted-foreground text-xs">{detail}</p>
          ) : null}
        </div>
        {Icon ? (
          <Icon className="text-muted-foreground/40 size-5 shrink-0" />
        ) : null}
      </CardContent>
    </Card>
  );
}
