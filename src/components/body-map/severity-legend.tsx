import { SEVERITY_LABELS, SEVERITY_VAR } from "@/domain/severity";
import type { SeverityLevel } from "@/domain/severity";

/**
 * Severity legend.
 *
 * Shown alongside the map because an unlabelled colour ramp is not
 * self-explanatory, and a clinician inferring that amber means moderate
 * is a clinician who might infer it wrong.
 */
const ORDER: SeverityLevel[] = [
  "NONE",
  "MINOR",
  "MODERATE",
  "SEVERE",
  "CRITICAL",
];

export function SeverityLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
      {ORDER.map((level) => (
        <div key={level} className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ background: SEVERITY_VAR[level] }}
            aria-hidden
          />
          <span className="text-muted-foreground text-xs">
            {SEVERITY_LABELS[level]}
          </span>
        </div>
      ))}
    </div>
  );
}
