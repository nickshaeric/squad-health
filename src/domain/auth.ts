/**
 * Roles and capabilities.
 *
 * Components must check capabilities, never roles. `can(ctx, "…")`
 * survives role restructuring; `role === "MEDICAL_LEAD"` does not.
 *
 * For the demo this runs client-side behind a visible role switcher.
 * In production the same matrix must be enforced server-side in the
 * data-access layer, with PostgreSQL RLS as the backstop.
 */

export const ROLES = [
  "CLUB_ADMIN",
  "MEDICAL_LEAD",
  "MEDICAL_STAFF",
  "HEAD_COACH",
  "COACH",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  CLUB_ADMIN: "Club administrator",
  MEDICAL_LEAD: "Medical lead",
  MEDICAL_STAFF: "Medical staff",
  HEAD_COACH: "Head coach",
  COACH: "Assistant coach",
};

/**
 * Short description of what each role can see, for the demo role
 * switcher. Framed as a confidentiality feature, per the spec.
 */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  CLUB_ADMIN:
    "Squad aggregates and availability. No access to diagnoses.",
  MEDICAL_LEAD:
    "Full clinical record. Sole authority to clear a player for match play.",
  MEDICAL_STAFF:
    "Treatment and early rehabilitation stages. Cannot clear final stages.",
  HEAD_COACH:
    "Availability, body region, and rehabilitation stage. No diagnoses.",
  COACH:
    "Availability and expected return only. Can log a pitchside incident.",
};

export const CAPABILITIES = [
  // Players
  "player.read.basic",
  "player.read.contact",
  "player.write",
  "player.delete",
// Availability
  "availability.read",
  "availability.write",

  // Injury — availability tier
  "injury.read.availability",
  "injury.create.quick",

  // Injury — clinical tier
  "injury.read.clinical",
  "injury.write.clinical",
  "injury.delete",

  // Rehabilitation
  "rehab.read",
  "rehab.stage.advance.early",
  "rehab.stage.advance.medical",

  // Assessments
  "assessment.read",
  "assessment.write",

  // Treatment
  "treatment.read.schedule",
  "treatment.read.clinical",
  "treatment.write",

  // Medical examinations
  "exam.read",
  "exam.write",

  // Discipline
  "discipline.read",
  "discipline.write",

  // Reporting
  "report.availability.generate",
  "report.clinical.generate",
  "report.export.csv",

  // Administration
  "club.settings.write",
  "member.manage",
  "audit.read",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

/**
 * Capability grants per role.
 *
 * Deliberate asymmetries:
 *
 * - CLUB_ADMIN has no clinical capability. Not a clinician; GDPR
 *   Art. 9 lawful basis does not extend to squad valuation.
 * - COACH and HEAD_COACH hold `injury.create.quick` without
 *   `injury.read.clinical` — write-only into the clinical record, so
 *   pitchside capture works when no physio is present.
 * - Only MEDICAL_LEAD holds `rehab.stage.advance.medical`, gating
 *   stages 5–6 (medical test, match ready).
 * - `report.clinical.generate` and clinical CSV export are restricted
 *   and must be audited in production.
 */
const GRANTS: Record<Role, readonly Capability[]> = {
  MEDICAL_LEAD: [
    "player.read.basic",
    "player.read.contact",
    "player.write",
    "availability.read",
    "availability.write",
    "injury.read.availability",
    "injury.create.quick",
    "injury.read.clinical",
    "injury.write.clinical",
    "injury.delete",
    "rehab.read",
    "rehab.stage.advance.early",
    "rehab.stage.advance.medical",
    "assessment.read",
    "assessment.write",
    "treatment.read.schedule",
    "treatment.read.clinical",
    "treatment.write",
    "exam.read",
    "exam.write",
    "discipline.read",
    "report.availability.generate",
    "report.clinical.generate",
    "report.export.csv",
  ],

  MEDICAL_STAFF: [
    "player.read.basic",
    "player.read.contact",
    "availability.read",
    "availability.write",
    "injury.read.availability",
    "injury.create.quick",
    "injury.read.clinical",
    "injury.write.clinical",
    "rehab.read",
    "rehab.stage.advance.early",
    "assessment.read",
    "assessment.write",
    "treatment.read.schedule",
    "treatment.read.clinical",
    "treatment.write",
    "exam.read",
    "discipline.read",
    "report.availability.generate",
  ],

  HEAD_COACH: [
    "player.read.basic",
    "availability.read",
    "availability.write",
    "injury.read.availability",
    "injury.create.quick",
    "rehab.read",
    "treatment.read.schedule",
    "exam.read",
    "discipline.read",
    "discipline.write",
    "report.availability.generate",
  ],

  COACH: [
    "player.read.basic",
    "availability.read",
    "injury.read.availability",
    "injury.create.quick",
    "discipline.read",
  ],

  CLUB_ADMIN: [
    "player.read.basic",
    "player.read.contact",
    "player.write",
    "player.delete",
    "availability.read",
    "injury.read.availability",
    "exam.read",
    "discipline.read",
    "discipline.write",
    "report.availability.generate",
    "report.export.csv",
    "club.settings.write",
    "member.manage",
    "audit.read",
  ],
};

const GRANT_SETS: Record<Role, ReadonlySet<Capability>> = {
  MEDICAL_LEAD: new Set(GRANTS.MEDICAL_LEAD),
  MEDICAL_STAFF: new Set(GRANTS.MEDICAL_STAFF),
  HEAD_COACH: new Set(GRANTS.HEAD_COACH),
  COACH: new Set(GRANTS.COACH),
  CLUB_ADMIN: new Set(GRANTS.CLUB_ADMIN),
};

export interface AuthContext {
  role: Role;
  clubId: string;
  userId: string;
}

export function can(
  ctx: AuthContext,
  capability: Capability,
): boolean {
  return GRANT_SETS[ctx.role].has(capability);
}

export function canAny(
  ctx: AuthContext,
  capabilities: readonly Capability[],
): boolean {
  return capabilities.some((c) => can(ctx, c));
}

export function canAll(
  ctx: AuthContext,
  capabilities: readonly Capability[],
): boolean {
  return capabilities.every((c) => can(ctx, c));
}

/** Capabilities held by a role, for the demo's permission display. */
export function capabilitiesFor(role: Role): readonly Capability[] {
  return GRANTS[role];
}

/** Whether a role may see clinical detail at all. */
export function hasClinicalAccess(role: Role): boolean {
  return GRANT_SETS[role].has("injury.read.clinical");
}
