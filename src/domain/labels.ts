import type {
  AbsenceBand,
  AvailabilityStatus,
  BodyRegion,
  BodySide,
  BodyView,
  Completeness,
  EpisodeStatus,
  InjuryActivity,
  InjuryMechanism,
  InjuryType,
  PlayerPosition,
  PlayingSurface,
  RehabStage,
  UnavailabilityReason,
} from "./types";

// Enums are wire values; screens need prose. Keeping the mapping in one
// place is also the seam for later hr/bs localisation.

export const REGION_LABELS: Record<BodyRegion, string> = {
  HEAD: "Head",
  NECK: "Neck",
  SHOULDER: "Shoulder",
  ARM: "Arm",
  HAND: "Hand",
  CHEST: "Chest",
  UPPER_BACK: "Upper back",
  LOWER_BACK: "Lower back",
  ABDOMEN: "Abdomen",
  HIP_GROIN: "Hip / groin",
  THIGH: "Thigh",
  KNEE: "Knee",
  LOWER_LEG: "Lower leg",
  ANKLE: "Ankle",
  FOOT: "Foot",
};

export const SIDE_LABELS: Record<BodySide, string> = {
  LEFT: "Left",
  RIGHT: "Right",
  CENTRAL: "",
};

/** "Left thigh", "Lower back". */
export function formatBodyLocation(
  region: BodyRegion,
  side: BodySide,
): string {
  const sideLabel = SIDE_LABELS[side];
  const regionLabel = REGION_LABELS[region];
  return sideLabel
    ? `${sideLabel} ${regionLabel.toLowerCase()}`
    : regionLabel;
}

export const INJURY_TYPE_LABELS: Record<InjuryType, string> = {
  MUSCLE_STRAIN: "Muscle strain",
  LIGAMENT_SPRAIN: "Ligament sprain",
  TENDON: "Tendon injury",
  CONTUSION: "Contusion",
  FRACTURE: "Fracture",
  DISLOCATION: "Dislocation",
  JOINT_CARTILAGE: "Joint / cartilage",
  LACERATION: "Laceration",
  OVERUSE: "Overuse",
  OTHER: "Other",
};

export const ACTIVITY_LABELS: Record<InjuryActivity, string> = {
  MATCH: "Match",
  TRAINING: "Training",
  WARM_UP: "Warm-up",
  CONDITIONING: "Conditioning",
  OTHER: "Other",
};

export const SURFACE_LABELS: Record<PlayingSurface, string> = {
  NATURAL_GRASS: "Natural grass",
  ARTIFICIAL_TURF: "Artificial turf",
  HYBRID: "Hybrid",
  INDOOR: "Indoor",
  GYM: "Gym",
  OTHER: "Other",
};

export const MECHANISM_LABELS: Record<InjuryMechanism, string> = {
  NON_CONTACT: "Non-contact",
  CONTACT_PLAYER: "Contact with player",
  CONTACT_OBJECT: "Contact with object",
  OVERUSE_GRADUAL: "Gradual onset",
  RECURRENCE: "Recurrence",
  UNKNOWN: "Unknown",
};

export const ABSENCE_BAND_LABELS: Record<AbsenceBand, string> = {
  NONE: "No absence",
  DAYS_1_3: "1–3 days",
  DAYS_4_7: "4–7 days",
  WEEKS_1_4: "1–4 weeks",
  WEEKS_4_12: "1–3 months",
  MONTHS_3_PLUS: "3+ months",
};

export const STATUS_LABELS: Record<EpisodeStatus, string> = {
  REPORTED: "Reported",
  ASSESSED: "Assessed",
  IN_TREATMENT: "In treatment",
  IN_REHAB: "In rehab",
  RETURNED_TRAINING: "Returned to training",
  RETURNED_MATCH: "Returned to matches",
  CLEARED: "Cleared",
};

export const COMPLETENESS_LABELS: Record<Completeness, string> = {
  QUICK: "Quick log",
  COMPLETE: "Complete",
};

export const REHAB_STAGE_LABELS: Record<RehabStage, string> = {
  FIRST_TREATMENT: "First treatment",
  FOLLOW_UP_EXAM: "Follow-up examination",
  INDIVIDUAL_TRAINING: "Individual training",
  TEAM_TRAINING: "Training with team",
  MEDICAL_TEST: "Medical test",
  MATCH_READY: "Match ready",
};

export const UNAVAILABILITY_REASON_LABELS: Record<
  UnavailabilityReason,
  string
> = {
  INJURY: "Injury",
  ILLNESS: "Illness",
  SUSPENSION: "Suspension",
  PERSONAL: "Personal",
  INTERNATIONAL_DUTY: "International duty",
  NOT_REGISTERED: "Not registered",
};

export const AVAILABILITY_STATUS_LABELS: Record<
  AvailabilityStatus,
  string
> = {
  AVAILABLE: "Available",
  DOUBTFUL: "Doubtful",
  UNAVAILABLE: "Unavailable",
};

export const POSITION_LABELS: Record<PlayerPosition, string> = {
  GK: "Goalkeeper",
  CB: "Centre-back",
  LB: "Left-back",
  RB: "Right-back",
  DM: "Defensive midfielder",
  CM: "Central midfielder",
  AM: "Attacking midfielder",
  LW: "Left winger",
  RW: "Right winger",
  ST: "Striker",
};

export const VIEW_LABELS: Record<BodyView, string> = {
  ANTERIOR: "Front",
  POSTERIOR: "Back",
  LEFT: "Left",
  RIGHT: "Right",
};

/** Severity grade description. Tissue damage, not pain. */
export const SEVERITY_GRADE_LABELS: Record<number, string> = {
  1: "Grade 1 — minor",
  2: "Grade 2 — moderate",
  3: "Grade 3 — severe",
  4: "Grade 4 — complete rupture",
};
