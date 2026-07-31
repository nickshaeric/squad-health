import type {
  AbsenceBand,
  BodyRegion,
  InjuryActivity,
  InjuryMechanism,
  InjuryType,
  PlayingSurface,
  SeverityGrade,
} from "@/domain/types";

/**
 * Region frequencies approximating published football injury
 * epidemiology: lower-limb dominant, thigh and ankle leading, upper body
 * rare outside goalkeepers.
 *
 * These weights exist so the Injury Trends chart has the shape a coach
 * or physio expects. A uniform distribution across fifteen regions would
 * immediately read as synthetic.
 */
export const REGION_WEIGHTS: readonly [BodyRegion, number][] = [
  ["THIGH", 22],
  ["ANKLE", 15],
  ["KNEE", 13],
  ["HIP_GROIN", 11],
  ["LOWER_LEG", 10],
  ["LOWER_BACK", 7],
  ["FOOT", 5],
  ["SHOULDER", 4],
  ["HEAD", 3],
  ["ABDOMEN", 3],
  ["NECK", 2],
  ["UPPER_BACK", 2],
  ["HAND", 2],
  ["ARM", 1],
  ["CHEST", 1],
];

/**
 * Plausible injury types per region. Prevents a "fracture of the thigh"
 * or a "muscle strain of the hand" from appearing in the data.
 */
export const REGION_INJURY_TYPES: Record<
  BodyRegion,
  readonly [InjuryType, number][]
> = {
  HEAD: [
    ["CONTUSION", 6],
    ["LACERATION", 3],
    ["OTHER", 1],
  ],
  NECK: [
    ["MUSCLE_STRAIN", 6],
    ["CONTUSION", 3],
    ["OTHER", 1],
  ],
  SHOULDER: [
    ["LIGAMENT_SPRAIN", 4],
    ["DISLOCATION", 3],
    ["CONTUSION", 2],
    ["TENDON", 1],
  ],
  ARM: [
    ["CONTUSION", 5],
    ["FRACTURE", 3],
    ["MUSCLE_STRAIN", 2],
  ],
  HAND: [
    ["FRACTURE", 4],
    ["LIGAMENT_SPRAIN", 3],
    ["CONTUSION", 3],
  ],
  CHEST: [
    ["CONTUSION", 7],
    ["OTHER", 3],
  ],
  UPPER_BACK: [
    ["MUSCLE_STRAIN", 7],
    ["CONTUSION", 3],
  ],
  LOWER_BACK: [
    ["MUSCLE_STRAIN", 6],
    ["OVERUSE", 3],
    ["OTHER", 1],
  ],
  ABDOMEN: [
    ["MUSCLE_STRAIN", 6],
    ["CONTUSION", 4],
  ],
  HIP_GROIN: [
    ["MUSCLE_STRAIN", 6],
    ["OVERUSE", 3],
    ["TENDON", 1],
  ],
  THIGH: [
    ["MUSCLE_STRAIN", 8],
    ["CONTUSION", 2],
  ],
  KNEE: [
    ["LIGAMENT_SPRAIN", 5],
    ["JOINT_CARTILAGE", 2],
    ["CONTUSION", 2],
    ["TENDON", 1],
  ],
  LOWER_LEG: [
    ["MUSCLE_STRAIN", 4],
    ["CONTUSION", 3],
    ["OVERUSE", 2],
    ["FRACTURE", 1],
  ],
  ANKLE: [
    ["LIGAMENT_SPRAIN", 7],
    ["CONTUSION", 2],
    ["FRACTURE", 1],
  ],
  FOOT: [
    ["CONTUSION", 4],
    ["OVERUSE", 3],
    ["FRACTURE", 2],
    ["LIGAMENT_SPRAIN", 1],
  ],
};

/**
 * Mechanism depends on injury type more than on region. Muscle strains
 * are overwhelmingly non-contact; contusions are the opposite.
 */
export const TYPE_MECHANISMS: Record<
  InjuryType,
  readonly [InjuryMechanism, number][]
> = {
  MUSCLE_STRAIN: [
    ["NON_CONTACT", 8],
    ["OVERUSE_GRADUAL", 2],
  ],
  LIGAMENT_SPRAIN: [
    ["NON_CONTACT", 5],
    ["CONTACT_PLAYER", 5],
  ],
  TENDON: [
    ["OVERUSE_GRADUAL", 7],
    ["NON_CONTACT", 3],
  ],
  CONTUSION: [
    ["CONTACT_PLAYER", 8],
    ["CONTACT_OBJECT", 2],
  ],
  FRACTURE: [
    ["CONTACT_PLAYER", 6],
    ["CONTACT_OBJECT", 3],
    ["NON_CONTACT", 1],
  ],
  DISLOCATION: [
    ["CONTACT_PLAYER", 6],
    ["CONTACT_OBJECT", 2],
    ["NON_CONTACT", 2],
  ],
  JOINT_CARTILAGE: [
    ["NON_CONTACT", 5],
    ["CONTACT_PLAYER", 3],
    ["OVERUSE_GRADUAL", 2],
  ],
  LACERATION: [
    ["CONTACT_PLAYER", 7],
    ["CONTACT_OBJECT", 3],
  ],
  OVERUSE: [["OVERUSE_GRADUAL", 10]],
  OTHER: [
    ["UNKNOWN", 5],
    ["NON_CONTACT", 3],
    ["CONTACT_PLAYER", 2],
  ],
};

/**
 * Match exposure carries far higher injury incidence per hour than
 * training, but clubs train far more than they play. The result is a
 * roughly even split with training slightly ahead.
 */
export const ACTIVITY_WEIGHTS: readonly [InjuryActivity, number][] = [
  ["TRAINING", 45],
  ["MATCH", 40],
  ["WARM_UP", 8],
  ["CONDITIONING", 5],
  ["OTHER", 2],
];

/** Semi-professional Balkan clubs use artificial turf heavily. */
export const SURFACE_WEIGHTS: readonly [PlayingSurface, number][] = [
  ["NATURAL_GRASS", 45],
  ["ARTIFICIAL_TURF", 40],
  ["GYM", 8],
  ["HYBRID", 4],
  ["INDOOR", 2],
  ["OTHER", 1],
];

/**
 * Severity distribution. Most football injuries are minor; the tail is
 * thin but expensive.
 */
export const GRADE_WEIGHTS: readonly [SeverityGrade, number][] = [
  [1, 52],
  [2, 33],
  [3, 12],
  [4, 3],
];

/** Absence band implied by tissue grade. */
export const GRADE_ABSENCE: Record<
  SeverityGrade,
  readonly [AbsenceBand, number][]
> = {
  1: [
    ["DAYS_1_3", 4],
    ["DAYS_4_7", 5],
    ["WEEKS_1_4", 1],
  ],
  2: [
    ["DAYS_4_7", 2],
    ["WEEKS_1_4", 7],
    ["WEEKS_4_12", 1],
  ],
  3: [
    ["WEEKS_1_4", 2],
    ["WEEKS_4_12", 7],
    ["MONTHS_3_PLUS", 1],
  ],
  4: [
    ["WEEKS_4_12", 3],
    ["MONTHS_3_PLUS", 7],
  ],
};

/** Midpoint days per band, used to derive expected return dates. */
export const ABSENCE_DAYS: Record<AbsenceBand, number> = {
  NONE: 0,
  DAYS_1_3: 2,
  DAYS_4_7: 6,
  WEEKS_1_4: 17,
  WEEKS_4_12: 56,
  MONTHS_3_PLUS: 130,
};

/**
 * Regions where recurrence genuinely clusters. Used to concentrate the
 * recurrence flag rather than scattering it uniformly.
 */
export const RECURRENCE_PRONE_REGIONS: readonly BodyRegion[] = [
  "THIGH",
  "HIP_GROIN",
  "LOWER_LEG",
  "ANKLE",
];

/**
 * Diagnosis text per region and type. Clinical strings must look like a
 * clinician wrote them, since the demo's whole argument is that this
 * data is real enough to be worth protecting.
 */
export const DIAGNOSIS_TEMPLATES: Partial<
  Record<string, readonly string[]>
> = {
  "THIGH:MUSCLE_STRAIN": [
    "Biceps femoris strain, proximal myotendinous junction",
    "Semimembranosus strain, mid-muscle belly",
    "Rectus femoris strain, distal third",
    "Grade II hamstring strain, long head of biceps femoris",
  ],
  "THIGH:CONTUSION": [
    "Anterior quadriceps contusion, no intramuscular haematoma",
    "Lateral thigh contusion with localised swelling",
  ],
  "HIP_GROIN:MUSCLE_STRAIN": [
    "Adductor longus strain at proximal insertion",
    "Iliopsoas strain, no bony involvement",
  ],
  "HIP_GROIN:OVERUSE": [
    "Adductor-related groin pain, insidious onset",
    "Pubic-related groin pain consistent with early osteitis pubis",
  ],
  "ANKLE:LIGAMENT_SPRAIN": [
    "Lateral ankle sprain, ATFL grade II, CFL intact",
    "Inversion injury with isolated ATFL involvement",
    "Syndesmotic sprain, stable on external rotation stress",
  ],
  "KNEE:LIGAMENT_SPRAIN": [
    "MCL sprain grade II, no rotational instability",
    "ACL partial tear, Lachman 1+ with firm endpoint",
    "LCL sprain grade I, full range retained",
  ],
  "KNEE:JOINT_CARTILAGE": [
    "Medial meniscus tear, posterior horn",
    "Chondral irritation of medial femoral condyle",
  ],
  "LOWER_LEG:MUSCLE_STRAIN": [
    "Medial gastrocnemius strain, musculotendinous junction",
    "Soleus strain, low grade",
  ],
  "LOWER_LEG:OVERUSE": [
    "Medial tibial stress syndrome",
    "Posterior compartment overload, no stress reaction on imaging",
  ],
  "LOWER_BACK:MUSCLE_STRAIN": [
    "Lumbar paraspinal strain, no neurological deficit",
    "Mechanical low back pain, facet-mediated",
  ],
  "SHOULDER:DISLOCATION": [
    "Anterior glenohumeral dislocation, reduced on field",
    "Subluxation with transient axillary nerve symptoms, resolved",
  ],
  "HEAD:LACERATION": [
    "Supraorbital laceration, closed with three sutures",
    "Scalp laceration, no loss of consciousness",
  ],
  "FOOT:OVERUSE": [
    "Plantar fasciitis, medial calcaneal origin",
    "Second metatarsal stress reaction",
  ],
};

export function diagnosisFor(
  region: BodyRegion,
  type: InjuryType,
): string | null {
  const key = `${region}:${type}`;
  const templates = DIAGNOSIS_TEMPLATES[key];
  return templates ? templates[0] : null;
}
