import { Check, Lock } from "lucide-react";
import { REHAB_STAGE_LABELS } from "@/domain/labels";
import {
  MEDICAL_LEAD_GATED_STAGES,
  REHAB_STAGES,
  type RehabStage,
  type RehabStageProgress,
} from "@/domain/types";
import { userName } from "@/data/club";
import { cn } from "@/lib/utils";

/**
 * Six-stage rehabilitation progress.
 *
 * Stages five and six require the medical lead's approval. The lock icon
 * is not decoration: a physiotherapist can move a player into team
 * training but cannot declare him match ready, and showing where that
 * boundary sits is the point. `approvedByUserId` on each completed stage
 * is the record of who signed it off.
 */
export function RehabProgress({
  currentStage,
  progress,
}: {
  currentStage: RehabStage;
  progress: readonly RehabStageProgress[];
}) {
  const currentIndex = REHAB_STAGES.indexOf(currentStage);
  const byStage = new Map(progress.map((p) => [p.stage, p]));

  return (
    <ol className="space-y-0">
      {REHAB_STAGES.map((stage, index) => {
        const record = byStage.get(stage);
        const isComplete = record?.completedOn != null;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;
        const isGated = MEDICAL_LEAD_GATED_STAGES.includes(stage);

        return (
          <li key={stage} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  isComplete &&
                    "border-transparent bg-availability-available/20 text-availability-available",
                  isCurrent &&
                    "border-severity-moderate text-severity-moderate",
                  isFuture && "text-muted-foreground/50",
                )}
              >
                {isComplete ? (
                  <Check className="size-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              {index < REHAB_STAGES.length - 1 ? (
                <span
                  className={cn(
                    "w-px flex-1",
                    isComplete ? "bg-availability-available/40" : "bg-border",
                  )}
                />
              ) : null}
            </div>

            <div className={cn("pb-4", index === REHAB_STAGES.length - 1 && "pb-0")}>
              <div className="flex items-center gap-1.5">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isFuture && "text-muted-foreground",
                  )}
                >
                  {REHAB_STAGE_LABELS[stage]}
                </p>
                {isGated ? (
                  <Lock
                    className="text-muted-foreground/60 size-3"
                    aria-label="Requires medical lead approval"
                  />
                ) : null}
              </div>

              {record ? (
                <p className="text-muted-foreground text-xs">
                  {isComplete
                    ? `Completed ${formatDate(record.completedOn!)}`
                    : `Entered ${formatDate(record.enteredOn)}`}
                  {record.approvedByUserId
                    ? ` · ${userName(record.approvedByUserId)}`
                    : ""}
                </p>
              ) : isGated ? (
                <p className="text-muted-foreground/70 text-xs">
                  Requires club doctor sign-off
                </p>
              ) : null}

              {record?.note ? (
                <p className="text-muted-foreground mt-1 max-w-prose text-xs leading-snug">
                  {record.note}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
