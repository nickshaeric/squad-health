import { Badge } from "@/components/ui/badge";
import { AVAILABILITY_STATUS_LABELS } from "@/domain/labels";
import type { AvailabilityStatus } from "@/domain/types";
import { cn } from "@/lib/utils";

const STYLES: Record<AvailabilityStatus, string> = {
  AVAILABLE:
    "border-transparent bg-availability-available/15 text-availability-available",
  DOUBTFUL:
    "border-transparent bg-availability-doubtful/15 text-availability-doubtful",
  UNAVAILABLE:
    "border-transparent bg-availability-unavailable/15 text-availability-unavailable",
};

export function AvailabilityBadge({
  status,
  className,
}: {
  status: AvailabilityStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", STYLES[status], className)}
    >
      {AVAILABILITY_STATUS_LABELS[status]}
    </Badge>
  );
}
