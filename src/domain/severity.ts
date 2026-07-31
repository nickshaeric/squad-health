import type { AbsenceBand, SeverityGrade } from "./types";

/**
 * Display severity. Derived, never stored.
 *
 * Two independent inputs can imply severity: clinician-assessed tissue
 * grade (1–4), and estimated absence band. Coaches see only the latter,
 * so the body map must render sensibly from either.
 */
export const SEVERITY_LEVELS = [
  "NONE",
  "MINOR",
  "MODERATE",
  "SEVERE",
  "CRITICAL",
] as const;

export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

/** Tissue grade to display level. */
export function severityFromGrade(
  grade: SeverityGrade | null,
): SeverityLevel {
  switch (grade) {
    case 1:
      return "MINOR";
    case 2:
      return "MODERATE";
    case 3:
      return "SEVERE";
    case 4:
      return "CRITICAL";
    default:
      return "NONE";
  }
}

/**
 * Absence band to display level. This is the path used for coaching
 * roles, which never receive a tissue grade.
 */
export function severityFromAbsence(
  band: AbsenceBand | null,
): SeverityLevel {
  switch (band) {
    case "NONE":
      return "NONE";
    case "DAYS_1_3":
      return "MINOR";
    case "DAYS_4_7":
      return "MINOR";
    case "WEEKS_1_4":
      return "MODERATE";
    case "WEEKS_4_12":
      return "SEVERE";
    case "MONTHS_3_PLUS":
      return "CRITICAL";
    default:
      return "NONE";
  }
}

/** Tailwind class for a severity fill. */
export const SEVERITY_FILL: Record<SeverityLevel, string> = {
  NONE: "fill-severity-none",
  MINOR: "fill-severity-minor",
  MODERATE: "fill-severity-moderate",
  SEVERE: "fill-severity-severe",
  CRITICAL: "fill-severity-critical",
};

/** Raw CSS variable, for SVG gradient stops and inline fills. */
export const SEVERITY_VAR: Record<SeverityLevel, string> = {
  NONE: "var(--severity-none)",
  MINOR: "var(--severity-minor)",
  MODERATE: "var(--severity-moderate)",
  SEVERE: "var(--severity-severe)",
  CRITICAL: "var(--severity-critical)",
};

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  NONE: "No current issue",
  MINOR: "Minor",
  MODERATE: "Moderate",
  SEVERE: "Severe",
  CRITICAL: "Long-term",
};
