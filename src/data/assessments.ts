import type { PainAssessment } from "@/domain/types";

/**
 * Pain and function assessments.
 *
 * Authored only for the hero and the current episodes. Nobody opens a
 * resolved episode from eighteen months ago to read its pain curve, so
 * generating hundreds of series would be effort spent where it cannot
 * be seen.
 *
 * Pain is measured repeatedly on a 0-10 scale and is a different
 * construct from `severityGrade`, which is assessed once and describes
 * tissue damage. A player can have grade II damage and no pain at rest.
 * The spec is explicit that these must not be merged.
 *
 * `functionScore` is inverted relative to pain: higher is better.
 */

const MEDICAL_STAFF = "user-medical-staff";
const MEDICAL_LEAD = "user-medical-lead";

/**
 * The hero's current episode, twice weekly since onset on 2026-07-12.
 * Pain at load falls more slowly than pain at rest, which is the normal
 * pattern for a muscle injury and the reason return-to-play decisions
 * cannot rest on rest pain alone.
 */
const HERO_CURRENT: PainAssessment[] = [
  {
    id: "pa-hero4-01",
    episodeId: "ep-hero-4",
    assessedOn: "2026-07-13",
    painAtRest: 4,
    painOnLoad: 8,
    functionScore: 2,
    playerConfidence: 3,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_STAFF,
    note: "Antalgic gait. Walking only.",
  },
  {
    id: "pa-hero4-02",
    episodeId: "ep-hero-4",
    assessedOn: "2026-07-16",
    painAtRest: 2,
    painOnLoad: 7,
    functionScore: 4,
    playerConfidence: 4,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_STAFF,
    note: "Isometric loading tolerated at 60%.",
  },
  {
    id: "pa-hero4-03",
    episodeId: "ep-hero-4",
    assessedOn: "2026-07-20",
    painAtRest: 1,
    painOnLoad: 5,
    functionScore: 5,
    playerConfidence: 5,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_STAFF,
    note: "Concentric work introduced. No next-day reaction.",
  },
  {
    id: "pa-hero4-04",
    episodeId: "ep-hero-4",
    assessedOn: "2026-07-23",
    painAtRest: 0,
    painOnLoad: 4,
    functionScore: 6,
    playerConfidence: 6,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_STAFF,
    note: "Straight-line jogging, 60% max velocity.",
  },
  {
    id: "pa-hero4-05",
    episodeId: "ep-hero-4",
    assessedOn: "2026-07-27",
    painAtRest: 0,
    painOnLoad: 3,
    functionScore: 7,
    playerConfidence: 6,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_LEAD,
    note:
      "Eccentric loading commenced. Player reports the limb feels " +
      "'tight rather than sore', which is how he described the " +
      "February episode at the same stage.",
  },
  {
    id: "pa-hero4-06",
    episodeId: "ep-hero-4",
    assessedOn: "2026-07-29",
    painAtRest: 0,
    painOnLoad: 2,
    functionScore: 8,
    playerConfidence: 7,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_STAFF,
    note:
      "Progressing. Isokinetic assessment booked before any sprint " +
      "exposure, per the club doctor's instruction.",
  },
];

/**
 * The hero's February recurrence, retained so the Player Profile can
 * show two curves side by side. The February series is deliberately
 * slower to resolve than the current one.
 */
const HERO_FEBRUARY: PainAssessment[] = [
  {
    id: "pa-hero3-01",
    episodeId: "ep-hero-3",
    assessedOn: "2026-02-12",
    painAtRest: 3,
    painOnLoad: 7,
    functionScore: 3,
    playerConfidence: 2,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_LEAD,
    note: "Same site as October. Player visibly frustrated.",
  },
  {
    id: "pa-hero3-02",
    episodeId: "ep-hero-3",
    assessedOn: "2026-02-19",
    painAtRest: 1,
    painOnLoad: 6,
    functionScore: 4,
    playerConfidence: 3,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_STAFF,
    note: "Slower than expected at one week.",
  },
  {
    id: "pa-hero3-03",
    episodeId: "ep-hero-3",
    assessedOn: "2026-02-26",
    painAtRest: 0,
    painOnLoad: 4,
    functionScore: 6,
    playerConfidence: 5,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_STAFF,
    note: "Running progression started, one week behind plan.",
  },
  {
    id: "pa-hero3-04",
    episodeId: "ep-hero-3",
    assessedOn: "2026-03-05",
    painAtRest: 0,
    painOnLoad: 2,
    functionScore: 7,
    playerConfidence: 6,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_STAFF,
    note: "Change of direction introduced.",
  },
  {
    id: "pa-hero3-05",
    episodeId: "ep-hero-3",
    assessedOn: "2026-03-16",
    painAtRest: 0,
    painOnLoad: 1,
    functionScore: 9,
    playerConfidence: 8,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_LEAD,
    note:
      "Eccentric deficit reduced to 6% versus the right limb. Cleared " +
      "for full training. Nordic protocol to continue indefinitely.",
  },
];

const OTHER_CURRENT: PainAssessment[] = [
  // player-05, MCL sprain, still in treatment
  {
    id: "pa-cur1-01",
    episodeId: "ep-cur-1",
    assessedOn: "2026-07-20",
    painAtRest: 5,
    painOnLoad: 9,
    functionScore: 1,
    playerConfidence: 2,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_LEAD,
    note: "Braced. Partial weight bearing.",
  },
  {
    id: "pa-cur1-02",
    episodeId: "ep-cur-1",
    assessedOn: "2026-07-24",
    painAtRest: 3,
    painOnLoad: 7,
    functionScore: 3,
    playerConfidence: 3,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_STAFF,
    note: "Range 10-90 degrees, pain-free within that arc.",
  },
  {
    id: "pa-cur1-03",
    episodeId: "ep-cur-1",
    assessedOn: "2026-07-29",
    painAtRest: 2,
    painOnLoad: 6,
    functionScore: 4,
    playerConfidence: 4,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_STAFF,
    note: "Full extension achieved. Cycling introduced.",
  },

  // player-18, adductor strain, in rehab and close to return
  {
    id: "pa-cur2-01",
    episodeId: "ep-cur-2",
    assessedOn: "2026-07-08",
    painAtRest: 3,
    painOnLoad: 7,
    functionScore: 3,
    playerConfidence: 4,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_STAFF,
    note: "Copenhagen adduction, isometric only.",
  },
  {
    id: "pa-cur2-02",
    episodeId: "ep-cur-2",
    assessedOn: "2026-07-15",
    painAtRest: 1,
    painOnLoad: 4,
    functionScore: 6,
    playerConfidence: 6,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_STAFF,
    note: "Squeeze test 8/10 of unaffected side.",
  },
  {
    id: "pa-cur2-03",
    episodeId: "ep-cur-2",
    assessedOn: "2026-07-22",
    painAtRest: 0,
    painOnLoad: 2,
    functionScore: 8,
    playerConfidence: 7,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_STAFF,
    note: "Individual pitch work, all planes.",
  },
  {
    id: "pa-cur2-04",
    episodeId: "ep-cur-2",
    assessedOn: "2026-07-29",
    painAtRest: 0,
    painOnLoad: 1,
    functionScore: 9,
    playerConfidence: 8,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_LEAD,
    note: "Squeeze test symmetrical. Ready for team training.",
  },

  // player-22, calf strain, recent
  {
    id: "pa-cur3-01",
    episodeId: "ep-cur-3",
    assessedOn: "2026-07-27",
    painAtRest: 2,
    painOnLoad: 5,
    functionScore: 5,
    playerConfidence: 6,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_STAFF,
    note: "Heel raises pain-free. Low grade confirmed.",
  },
  {
    id: "pa-cur3-02",
    episodeId: "ep-cur-3",
    assessedOn: "2026-07-29",
    painAtRest: 0,
    painOnLoad: 3,
    functionScore: 7,
    playerConfidence: 7,
    source: "CLINICIAN",
    recordedByUserId: MEDICAL_STAFF,
    note: "Jogging tolerated. Expect training within days.",
  },
];

export const PAIN_ASSESSMENTS: PainAssessment[] = [
  ...HERO_CURRENT,
  ...HERO_FEBRUARY,
  ...OTHER_CURRENT,
].sort((a, b) => a.assessedOn.localeCompare(b.assessedOn));
