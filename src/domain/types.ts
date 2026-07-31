// ---------------------------------------------------------------------------
// Body model
// ---------------------------------------------------------------------------

/**
 * Canonical body regions. 15 regions chosen so each has a distinct SVG
 * target and a real epidemiological identity.
 *
 * THIGH deliberately collapses hamstring/quadriceps strains; granularity
 * is recovered via `injuryType` + `mechanism`, and can be split in a
 * later version without migrating the column.
 *
 * HIP_GROIN is one region because adductor and hip-flexor problems are
 * clinically entangled and coaches describe them as one complaint.
 */
export const BODY_REGIONS = [
  "HEAD",
  "NECK",
  "SHOULDER",
  "ARM",
  "HAND",
  "CHEST",
  "UPPER_BACK",
  "LOWER_BACK",
  "ABDOMEN",
  "HIP_GROIN",
  "THIGH",
  "KNEE",
  "LOWER_LEG",
  "ANKLE",
  "FOOT",
] as const;

export type BodyRegion = (typeof BODY_REGIONS)[number];

export const BODY_SIDES = ["LEFT", "RIGHT", "CENTRAL"] as const;
export type BodySide = (typeof BODY_SIDES)[number];

/**
 * Which sides are valid for a given region. Axial regions are CENTRAL
 * only; this prevents a "left lower back" from entering the data set.
 */
export const REGION_SIDES: Record<BodyRegion, readonly BodySide[]> = {
  HEAD: ["CENTRAL"],
  NECK: ["CENTRAL"],
  SHOULDER: ["LEFT", "RIGHT"],
  ARM: ["LEFT", "RIGHT"],
  HAND: ["LEFT", "RIGHT"],
  CHEST: ["CENTRAL"],
  UPPER_BACK: ["CENTRAL"],
  LOWER_BACK: ["CENTRAL"],
  ABDOMEN: ["CENTRAL"],
  HIP_GROIN: ["LEFT", "RIGHT"],
  THIGH: ["LEFT", "RIGHT"],
  KNEE: ["LEFT", "RIGHT"],
  LOWER_LEG: ["LEFT", "RIGHT"],
  ANKLE: ["LEFT", "RIGHT"],
  FOOT: ["LEFT", "RIGHT"],
};

export function isValidRegionSide(
  region: BodyRegion,
  side: BodySide,
): boolean {
  return REGION_SIDES[region].includes(side);
}

export const BODY_VIEWS = [
  "ANTERIOR",
  "POSTERIOR",
  "LEFT",
  "RIGHT",
] as const;
export type BodyView = (typeof BODY_VIEWS)[number];

// ---------------------------------------------------------------------------
// Injury classification
// ---------------------------------------------------------------------------

export const INJURY_TYPES = [
  "MUSCLE_STRAIN",
  "LIGAMENT_SPRAIN",
  "TENDON",
  "CONTUSION",
  "FRACTURE",
  "DISLOCATION",
  "JOINT_CARTILAGE",
  "LACERATION",
  "OVERUSE",
  "OTHER",
] as const;
export type InjuryType = (typeof INJURY_TYPES)[number];

export const INJURY_ACTIVITIES = [
  "MATCH",
  "TRAINING",
  "WARM_UP",
  "CONDITIONING",
  "OTHER",
] as const;
export type InjuryActivity = (typeof INJURY_ACTIVITIES)[number];

export const PLAYING_SURFACES = [
  "NATURAL_GRASS",
  "ARTIFICIAL_TURF",
  "HYBRID",
  "INDOOR",
  "GYM",
  "OTHER",
] as const;
export type PlayingSurface = (typeof PLAYING_SURFACES)[number];

export const INJURY_MECHANISMS = [
  "NON_CONTACT",
  "CONTACT_PLAYER",
  "CONTACT_OBJECT",
  "OVERUSE_GRADUAL",
  "RECURRENCE",
  "UNKNOWN",
] as const;
export type InjuryMechanism = (typeof INJURY_MECHANISMS)[number];

/**
 * Coarse absence estimate captured pitchside, when a precise return date
 * is not yet knowable. Mirrors the severity bands used in football
 * injury epidemiology.
 */
export const ABSENCE_BANDS = [
  "NONE",
  "DAYS_1_3",
  "DAYS_4_7",
  "WEEKS_1_4",
  "WEEKS_4_12",
  "MONTHS_3_PLUS",
] as const;
export type AbsenceBand = (typeof ABSENCE_BANDS)[number];

export const EPISODE_STATUSES = [
  "REPORTED",
  "ASSESSED",
  "IN_TREATMENT",
  "IN_REHAB",
  "RETURNED_TRAINING",
  "RETURNED_MATCH",
  "CLEARED",
] as const;
export type EpisodeStatus = (typeof EPISODE_STATUSES)[number];

export type Completeness = "QUICK" | "COMPLETE";

/** Clinician-assessed tissue damage, 1–4. Distinct from pain scores. */
export type SeverityGrade = 1 | 2 | 3 | 4;

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

/**
 * Availability is broader than injury. A coach's question is "who can be
 * selected", which injury data alone cannot answer.
 */
export const UNAVAILABILITY_REASONS = [
  "INJURY",
  "ILLNESS",
  "SUSPENSION",
  "PERSONAL",
  "INTERNATIONAL_DUTY",
  "NOT_REGISTERED",
] as const;
export type UnavailabilityReason =
  (typeof UNAVAILABILITY_REASONS)[number];

export const AVAILABILITY_STATUSES = [
  "AVAILABLE",
  "DOUBTFUL",
  "UNAVAILABLE",
] as const;
export type AvailabilityStatus =
  (typeof AVAILABILITY_STATUSES)[number];

// ---------------------------------------------------------------------------
// Players and squads
// ---------------------------------------------------------------------------

export const PLAYER_POSITIONS = [
  "GK",
  "CB",
  "LB",
  "RB",
  "DM",
  "CM",
  "AM",
  "LW",
  "RW",
  "ST",
] as const;
export type PlayerPosition = (typeof PLAYER_POSITIONS)[number];

export type Foot = "LEFT" | "RIGHT" | "BOTH";

export interface Player {
  id: string;
  clubId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  position: PlayerPosition;
  secondaryPosition: PlayerPosition | null;
  preferredFoot: Foot;
  heightCm: number;
  weightKg: number;
  shirtNumber: number;
  joinedOn: string;
  photoUrl: string | null;
}

export interface Season {
  id: string;
  clubId: string;
  label: string;
  startsOn: string;
  endsOn: string;
  isCurrent: boolean;
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  city: string;
  country: string;
  timezone: string;
}

// ---------------------------------------------------------------------------
// Injury episode projections
// ---------------------------------------------------------------------------

/**
 * The availability projection. Safe for coaching and administrative
 * roles: body region and expected return, no diagnosis.
 *
 * Clinical fields are ABSENT from this type, not null.
 */
export interface InjuryEpisodeAvailability {
  id: string;
  clubId: string;
  playerId: string;
  seasonId: string;
  status: EpisodeStatus;
  region: BodyRegion;
  side: BodySide;
  injuryType: InjuryType;
  activity: InjuryActivity;
  surface: PlayingSurface;
  mechanism: InjuryMechanism;
  onsetDate: string;
  estimatedAbsence: AbsenceBand | null;
  expectedReturnTraining: string | null;
  expectedReturnMatch: string | null;
  actualReturnTraining: string | null;
  actualReturnMatch: string | null;
  clearedDate: string | null;
  requiredImmediateSubstitution: boolean;
  completeness: Completeness;
  isRecurrence: boolean;
  previousEpisodeId: string | null;
  bodyMapHint: { x: number; y: number; view: BodyView } | null;
  reportedByUserId: string;
  createdAt: string;
  updatedAt: string;
}

/** The clinical projection. Medical roles only. */
export interface InjuryEpisodeClinical
  extends InjuryEpisodeAvailability {
  diagnosis: string | null;
  clinicalNotes: string | null;
  severityGrade: SeverityGrade | null;
}

export interface InjuryStatusEvent {
  id: string;
  episodeId: string;
  fromStatus: EpisodeStatus | null;
  toStatus: EpisodeStatus;
  occurredAt: string;
  note: string | null;
  actorUserId: string;
}

export interface PainAssessment {
  id: string;
  episodeId: string;
  assessedOn: string;
  painAtRest: number;
  painOnLoad: number;
  functionScore: number;
  playerConfidence: number;
  source: "CLINICIAN" | "PLAYER";
  recordedByUserId: string;
  note: string | null;
}

export interface AvailabilityBlock {
  id: string;
  clubId: string;
  playerId: string;
  reason: UnavailabilityReason;
  episodeId: string | null;
  startsOn: string;
  endsOn: string | null;
  matchesRemaining: number | null;
  nonClinicalNote: string | null;
}

// ---------------------------------------------------------------------------
// Rehabilitation
// ---------------------------------------------------------------------------

export const REHAB_STAGES = [
  "FIRST_TREATMENT",
  "FOLLOW_UP_EXAM",
  "INDIVIDUAL_TRAINING",
  "TEAM_TRAINING",
  "MEDICAL_TEST",
  "MATCH_READY",
] as const;
export type RehabStage = (typeof REHAB_STAGES)[number];

/** Stages 5 and 6 require medical-lead approval. */
export const MEDICAL_LEAD_GATED_STAGES: readonly RehabStage[] = [
  "MEDICAL_TEST",
  "MATCH_READY",
];

export function isMedicalLeadGated(stage: RehabStage): boolean {
  return MEDICAL_LEAD_GATED_STAGES.includes(stage);
}

export interface RehabPlan {
  id: string;
  clubId: string;
  episodeId: string;
  currentStage: RehabStage;
  startedOn: string;
  targetCompletionOn: string | null;
  completedOn: string | null;
}

export interface RehabStageProgress {
  id: string;
  planId: string;
  stage: RehabStage;
  enteredOn: string;
  completedOn: string | null;
  approvedByUserId: string | null;
  note: string | null;
}

export interface Treatment {
  id: string;
  clubId: string;
  episodeId: string;
  performedOn: string;
  modality: string;
  durationMinutes: number | null;
  performedByUserId: string;
  clinicalNote: string | null;
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  clubId: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
}
