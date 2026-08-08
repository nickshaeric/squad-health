import type {
  AbsenceBand,
  InjuryActivity,
  InjuryMechanism,
  InjuryType,
  PlayingSurface,
} from "@/domain/types";

/**
 * Pitchside option subsets.
 *
 * The full unions in domain/types.ts remain valid on the entity — these
 * are the values a trainer can pick in under 30 seconds. The COMPLETE
 * flow offers the remainder, so nothing here narrows what the data model
 * can hold.
 *
 * `satisfies readonly T[]` proves every member is a real union value
 * while keeping the literal tuple type, so a typo fails `pnpm build`
 * instead of widening to string.
 */

/**
 * Six of ten injury types. DISLOCATION, JOINT_CARTILAGE, LACERATION and
 * OVERUSE are rare enough pitchside that spending a thumb-sized tile on
 * each costs more than it saves; OTHER covers them until assessment.
 * Cross-check against data/distributions.ts before changing this set.
 */
export const QUICK_INJURY_TYPES = [
  "MUSCLE_STRAIN",
  "LIGAMENT_SPRAIN",
  "CONTUSION",
  "TENDON",
  "FRACTURE",
  "OTHER",
] as const satisfies readonly InjuryType[];

/** All five activities. Each is one tap and all are plausible. */
export const QUICK_ACTIVITIES = [
  "MATCH",
  "TRAINING",
  "WARM_UP",
  "CONDITIONING",
  "OTHER",
] as const satisfies readonly InjuryActivity[];

/**
 * All six surfaces. GYM and INDOOR are distinct because a conditioning
 * injury on a gym floor is not an indoor-pitch injury.
 */
export const QUICK_SURFACES = [
  "NATURAL_GRASS",
  "ARTIFICIAL_TURF",
  "HYBRID",
  "INDOOR",
  "GYM",
  "OTHER",
] as const satisfies readonly PlayingSurface[];

/**
 * RECURRENCE is excluded deliberately. Recurrence is the `isRecurrence`
 * boolean on the episode, and offering it here permits the contradictory
 * record `mechanism: "RECURRENCE"` with `isRecurrence: false`. Detecting
 * recurrence needs the player's prior episodes for the same region,
 * which is assessment work, not capture work.
 *
 * UNKNOWN is first-class, not a hidden escape hatch: a trainer who did
 * not see the incident should say so in one tap rather than guess between
 * NON_CONTACT and CONTACT_PLAYER. Forcing the guess produces analytics
 * that look precise and are not.
 */
export const QUICK_MECHANISMS = [
  "NON_CONTACT",
  "CONTACT_PLAYER",
  "CONTACT_OBJECT",
  "OVERUSE_GRADUAL",
  "UNKNOWN",
] as const satisfies readonly InjuryMechanism[];

/**
 * All six bands. NONE is selectable and legitimate — a knock where the
 * player continued — and means "logged, no absence expected", not
 * "nothing happened".
 */
export const QUICK_ABSENCE_BANDS = [
  "NONE",
  "DAYS_1_3",
  "DAYS_4_7",
  "WEEKS_1_4",
  "WEEKS_4_12",
  "MONTHS_3_PLUS",
] as const satisfies readonly AbsenceBand[];
