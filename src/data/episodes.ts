import type {
  AbsenceBand,
  BodyRegion,
  BodySide,
  EpisodeStatus,
  InjuryEpisodeClinical,
  SeverityGrade,
} from "@/domain/types";
import { REGION_SIDES } from "@/domain/types";
import { CLUB, DEMO_TODAY } from "./club";
import { PLAYERS } from "./players";
import {
  ABSENCE_DAYS,
  ACTIVITY_WEIGHTS,
  GRADE_ABSENCE,
  GRADE_WEIGHTS,
  MILD_GRADE_WEIGHTS,
  MILD_ONLY_REGIONS,
  RECURRENCE_PRONE_REGIONS,
  REGION_INJURY_TYPES,
  REGION_WEIGHTS,
  SURFACE_WEIGHTS,
  TYPE_MECHANISMS,
  diagnosisFor,
} from "./distributions";
import { createRng } from "./rng";

// ---------------------------------------------------------------------------
// Date helpers
//
// Seed dates are plain ISO strings, not Date objects, so the data is
// serialisable and timezone-independent. Production stores UTC timestamps
// and renders in club-local time; a demo does not need that machinery.
// ---------------------------------------------------------------------------

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00Z`).getTime();
  const b = new Date(`${to}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86400000);
}

function timestamp(iso: string, hour = 10): string {
  return `${iso}T${String(hour).padStart(2, "0")}:00:00.000Z`;
}

// ---------------------------------------------------------------------------
// Hand-authored current episodes
//
// Everything a viewer can click into during the demo is authored by hand.
// Generated records are fine in aggregate but fall apart under scrutiny,
// and these six are the ones under scrutiny.
//
// Target current state: 18 fit, 7 unavailable, 1 doubtful. That gives a
// realistic pre-season unavailability rate rather than a squad that looks
// like a casualty ward.
// ---------------------------------------------------------------------------

const MEDICAL_LEAD = "user-medical-lead";
const MEDICAL_STAFF = "user-medical-staff";
const HEAD_COACH = "user-head-coach";
const COACH = "user-coach";

/**
 * The demo's focus. Nikola Đurić, 27, central midfielder, four episodes
 * across two seasons with a genuine recurrence chain: a grade II
 * hamstring strain in October 2025, a re-injury in February 2026 after
 * returning to full training, and the current episode.
 *
 * This is the most common recurrence pattern in football and the one a
 * coach recognises without explanation.
 */
const HERO_EPISODES: InjuryEpisodeClinical[] = [
  {
    id: "ep-hero-1",
    clubId: CLUB.id,
    playerId: "player-10",
    seasonId: "season-2425",
    status: "CLEARED",
    region: "ANKLE",
    side: "RIGHT",
    injuryType: "LIGAMENT_SPRAIN",
    activity: "MATCH",
    surface: "ARTIFICIAL_TURF",
    mechanism: "CONTACT_PLAYER",
    onsetDate: "2024-09-21",
    estimatedAbsence: "WEEKS_1_4",
    expectedReturnTraining: "2024-10-05",
    expectedReturnMatch: "2024-10-12",
    actualReturnTraining: "2024-10-08",
    actualReturnMatch: "2024-10-19",
    clearedDate: "2024-10-19",
    requiredImmediateSubstitution: true,
    completeness: "COMPLETE",
    isRecurrence: false,
    previousEpisodeId: null,
    bodyMapHint: { x: 0.46, y: 0.88, view: "ANTERIOR" },
    reportedByUserId: MEDICAL_STAFF,
    createdAt: timestamp("2024-09-21", 20),
    updatedAt: timestamp("2024-10-19", 11),
    diagnosis: "Lateral ankle sprain, ATFL grade II, CFL intact",
    clinicalNotes:
      "Inversion mechanism following a challenge on the right flank. " +
      "Immediate swelling, unable to continue. Ottawa rules negative, " +
      "no imaging indicated. Progressed through proprioceptive loading " +
      "without setback. Cleared for full contact 19/10.",
    severityGrade: 2,
  },
  {
    id: "ep-hero-2",
    clubId: CLUB.id,
    playerId: "player-10",
    seasonId: "season-2526",
    status: "CLEARED",
    region: "THIGH",
    side: "LEFT",
    injuryType: "MUSCLE_STRAIN",
    activity: "MATCH",
    surface: "NATURAL_GRASS",
    mechanism: "NON_CONTACT",
    onsetDate: "2025-10-18",
    estimatedAbsence: "WEEKS_1_4",
    expectedReturnTraining: "2025-11-01",
    expectedReturnMatch: "2025-11-08",
    actualReturnTraining: "2025-11-05",
    actualReturnMatch: "2025-11-15",
    clearedDate: "2025-11-15",
    requiredImmediateSubstitution: true,
    completeness: "COMPLETE",
    isRecurrence: false,
    previousEpisodeId: null,
    bodyMapHint: { x: 0.55, y: 0.66, view: "POSTERIOR" },
    reportedByUserId: MEDICAL_STAFF,
    createdAt: timestamp("2025-10-18", 17),
    updatedAt: timestamp("2025-11-15", 9),
    diagnosis: "Grade II hamstring strain, long head of biceps femoris",
    clinicalNotes:
      "Felt a sharp pull sprinting in transition, 71st minute, no " +
      "contact. Palpable defect 8cm below ischial tuberosity. " +
      "Ultrasound confirmed grade II. Returned to match play at four " +
      "weeks, marginally later than the initial estimate.",
    severityGrade: 2,
  },
  {
    id: "ep-hero-3",
    clubId: CLUB.id,
    playerId: "player-10",
    seasonId: "season-2526",
    status: "CLEARED",
    region: "THIGH",
    side: "LEFT",
    injuryType: "MUSCLE_STRAIN",
    activity: "TRAINING",
    surface: "ARTIFICIAL_TURF",
    mechanism: "RECURRENCE",
    onsetDate: "2026-02-11",
    estimatedAbsence: "WEEKS_1_4",
    expectedReturnTraining: "2026-02-28",
    expectedReturnMatch: "2026-03-07",
    actualReturnTraining: "2026-03-09",
    actualReturnMatch: "2026-03-21",
    clearedDate: "2026-03-21",
    requiredImmediateSubstitution: false,
    completeness: "COMPLETE",
    isRecurrence: true,
    previousEpisodeId: "ep-hero-2",
    bodyMapHint: { x: 0.55, y: 0.65, view: "POSTERIOR" },
    reportedByUserId: MEDICAL_LEAD,
    createdAt: timestamp("2026-02-11", 12),
    updatedAt: timestamp("2026-03-21", 10),
    diagnosis:
      "Re-injury, long head of biceps femoris at previous scar site",
    clinicalNotes:
      "Recurrence at the October site during a small-sided drill. Onset " +
      "less acute than the index injury but at the same location. " +
      "Eccentric strength deficit of 14% versus the right limb was " +
      "documented at the previous discharge and had not fully resolved. " +
      "Rehabilitation extended and Nordic loading maintained through " +
      "return to play.",
    severityGrade: 2,
  },
  {
    id: "ep-hero-4",
    clubId: CLUB.id,
    playerId: "player-10",
    seasonId: "season-2526",
    status: "IN_REHAB",
    region: "THIGH",
    side: "LEFT",
    injuryType: "MUSCLE_STRAIN",
    activity: "MATCH",
    surface: "NATURAL_GRASS",
    mechanism: "NON_CONTACT",
    onsetDate: "2026-07-12",
    estimatedAbsence: "WEEKS_1_4",
    expectedReturnTraining: "2026-08-02",
    expectedReturnMatch: "2026-08-16",
    actualReturnTraining: null,
    actualReturnMatch: null,
    clearedDate: null,
    requiredImmediateSubstitution: true,
    completeness: "COMPLETE",
    isRecurrence: true,
    previousEpisodeId: "ep-hero-3",
    bodyMapHint: { x: 0.55, y: 0.65, view: "POSTERIOR" },
    reportedByUserId: MEDICAL_STAFF,
    createdAt: timestamp("2026-07-12", 19),
    updatedAt: timestamp("2026-07-28", 9),
    diagnosis: "Third episode, left biceps femoris, grade I-II",
    clinicalNotes:
      "Third hamstring episode in ten months, same limb, same muscle. " +
      "Lower grade than the previous two but the pattern is now the " +
      "clinical concern rather than this individual injury. Referred " +
      "for isokinetic assessment before any return to sprint loading. " +
      "Recommend a dedicated posterior chain block through pre-season " +
      "regardless of symptom resolution.",
    severityGrade: 1,
  },
];

/**
 * The other current unavailabilities. Deliberately varied so the Team
 * Health Overview shows a range of statuses and completeness states.
 */
const CURRENT_EPISODES: InjuryEpisodeClinical[] = [
  {
    id: "ep-cur-1",
    clubId: CLUB.id,
    playerId: "player-05",
    seasonId: "season-2526",
    status: "IN_TREATMENT",
    region: "KNEE",
    side: "RIGHT",
    injuryType: "LIGAMENT_SPRAIN",
    activity: "MATCH",
    surface: "NATURAL_GRASS",
    mechanism: "CONTACT_PLAYER",
    onsetDate: "2026-07-19",
    estimatedAbsence: "WEEKS_4_12",
    expectedReturnTraining: "2026-09-06",
    expectedReturnMatch: "2026-09-20",
    actualReturnTraining: null,
    actualReturnMatch: null,
    clearedDate: null,
    requiredImmediateSubstitution: true,
    completeness: "COMPLETE",
    isRecurrence: false,
    previousEpisodeId: null,
    bodyMapHint: { x: 0.44, y: 0.75, view: "ANTERIOR" },
    reportedByUserId: MEDICAL_LEAD,
    createdAt: timestamp("2026-07-19", 18),
    updatedAt: timestamp("2026-07-26", 14),
    diagnosis: "MCL sprain grade II, no rotational instability",
    clinicalNotes:
      "Valgus loading in a challenge, immediate medial pain. Lachman " +
      "negative, no effusion at 48 hours. Braced for four weeks with " +
      "protected range. Straight-line running anticipated from week six.",
    severityGrade: 2,
  },
  {
    id: "ep-cur-2",
    clubId: CLUB.id,
    playerId: "player-18",
    seasonId: "season-2526",
    status: "IN_REHAB",
    region: "HIP_GROIN",
    side: "RIGHT",
    injuryType: "MUSCLE_STRAIN",
    activity: "TRAINING",
    surface: "ARTIFICIAL_TURF",
    mechanism: "NON_CONTACT",
    onsetDate: "2026-07-06",
    estimatedAbsence: "WEEKS_1_4",
    expectedReturnTraining: "2026-07-27",
    expectedReturnMatch: "2026-08-03",
    actualReturnTraining: null,
    actualReturnMatch: null,
    clearedDate: null,
    requiredImmediateSubstitution: false,
    completeness: "COMPLETE",
    isRecurrence: false,
    previousEpisodeId: null,
    bodyMapHint: { x: 0.47, y: 0.55, view: "ANTERIOR" },
    reportedByUserId: MEDICAL_STAFF,
    createdAt: timestamp("2026-07-06", 11),
    updatedAt: timestamp("2026-07-29", 10),
    diagnosis: "Adductor longus strain at proximal insertion",
    clinicalNotes:
      "Gradual tightening over two sessions before a clear onset during " +
      "change of direction. Copenhagen progression tolerated well. " +
      "Currently completing individual pitch work; slightly behind the " +
      "original training estimate but symptom-free at load.",
    severityGrade: 1,
  },
  {
    id: "ep-cur-3",
    clubId: CLUB.id,
    playerId: "player-22",
    seasonId: "season-2526",
    status: "ASSESSED",
    region: "LOWER_LEG",
    side: "LEFT",
    injuryType: "MUSCLE_STRAIN",
    activity: "MATCH",
    surface: "NATURAL_GRASS",
    mechanism: "NON_CONTACT",
    onsetDate: "2026-07-26",
    estimatedAbsence: "DAYS_4_7",
    expectedReturnTraining: "2026-08-01",
    expectedReturnMatch: "2026-08-03",
    actualReturnTraining: null,
    actualReturnMatch: null,
    clearedDate: null,
    requiredImmediateSubstitution: true,
    completeness: "COMPLETE",
    isRecurrence: false,
    previousEpisodeId: null,
    bodyMapHint: { x: 0.56, y: 0.84, view: "POSTERIOR" },
    reportedByUserId: MEDICAL_STAFF,
    createdAt: timestamp("2026-07-26", 21),
    updatedAt: timestamp("2026-07-27", 9),
    diagnosis: "Medial gastrocnemius strain, low grade",
    clinicalNotes:
      "Cramping sensation late in the match, withdrawn as a precaution. " +
      "No palpable defect. Expect a short absence with return to " +
      "training within the week.",
    severityGrade: 1,
  },
  {
    id: "ep-cur-4",
    clubId: CLUB.id,
    playerId: "player-13",
    seasonId: "season-2526",
    status: "REPORTED",
    region: "ANKLE",
    side: "LEFT",
    injuryType: "LIGAMENT_SPRAIN",
    activity: "TRAINING",
    surface: "ARTIFICIAL_TURF",
    mechanism: "NON_CONTACT",
    onsetDate: "2026-07-29",
    estimatedAbsence: "DAYS_4_7",
    expectedReturnTraining: null,
    expectedReturnMatch: null,
    actualReturnTraining: null,
    actualReturnMatch: null,
    clearedDate: null,
    requiredImmediateSubstitution: false,
    completeness: "QUICK",
    isRecurrence: false,
    previousEpisodeId: null,
    bodyMapHint: { x: 0.54, y: 0.88, view: "ANTERIOR" },
    reportedByUserId: COACH,
    createdAt: timestamp("2026-07-29", 18),
    updatedAt: timestamp("2026-07-29", 18),
    diagnosis: null,
    clinicalNotes: null,
    severityGrade: null,
  },
];

// ---------------------------------------------------------------------------
// Generated history
//
// Hand-authoring a hundred resolved episodes from eighteen months ago is
// a poor use of a deadline: nobody clicks into them, and in a bar chart
// they are indistinguishable from authored records. What matters is that
// the aggregate shape is epidemiologically plausible, which the weighted
// distributions handle.
// ---------------------------------------------------------------------------

const rng = createRng(0x5144484c); // "SQDH"

/** Players eligible for generated history, excluding the hero. */
const HISTORY_PLAYERS = PLAYERS.filter((p) => p.id !== "player-10");

function pickSide(region: BodyRegion): BodySide {
  const sides = REGION_SIDES[region];
  return sides.length === 1 ? sides[0] : rng.pick(sides);
}

function statusForResolved(): EpisodeStatus {
  return rng.bool(0.9) ? "CLEARED" : "RETURNED_MATCH";
}

interface GeneratedWindow {
  seasonId: string;
  from: string;
  to: string;
  count: number;
}

/**
 * Two seasons of history. Season-over-season comparison is nearly free
 * once the data exists and is disproportionately convincing in a pitch,
 * whereas a single season offers no comparison axis at all.
 */
const WINDOWS: GeneratedWindow[] = [
  {
    seasonId: "season-2425",
    from: "2024-07-15",
    to: "2025-06-15",
    count: 48,
  },
  {
    seasonId: "season-2526",
    from: "2025-07-15",
    to: "2026-07-05",
    count: 54,
  },
];

function generateEpisodes(): InjuryEpisodeClinical[] {
  const out: InjuryEpisodeClinical[] = [];

  /** Tracks resolved episodes per player-region, to chain recurrences. */
  const priorByKey = new Map<string, string>();

  let counter = 0;

  for (const window of WINDOWS) {
    const span = daysBetween(window.from, window.to);

    for (let i = 0; i < window.count; i++) {
      counter += 1;
      const id = `ep-gen-${String(counter).padStart(3, "0")}`;

      const player = rng.pick(HISTORY_PLAYERS);
      const region = rng.weighted(REGION_WEIGHTS);
      const side = pickSide(region);
      const injuryType = rng.weighted(REGION_INJURY_TYPES[region]);
      const mechanism = rng.weighted(TYPE_MECHANISMS[injuryType]);
      const activity = rng.weighted(ACTIVITY_WEIGHTS);
      const surface = rng.weighted(SURFACE_WEIGHTS);

      // Regions that cannot plausibly produce a long absence draw from a
      // capped grade distribution, so a lumbar strain does not outrank a
      // hamstring tear in mean days out.
      const grade: SeverityGrade = MILD_ONLY_REGIONS.includes(region)
        ? rng.weighted(MILD_GRADE_WEIGHTS)
        : rng.weighted(GRADE_WEIGHTS);

      const band: AbsenceBand = rng.weighted(GRADE_ABSENCE[grade]);

      const onsetDate = addDays(window.from, rng.int(0, span));
      const expectedDays = ABSENCE_DAYS[band];

      // Real returns scatter around the estimate, skewed late. Estimates
      // that were always exactly right would make the estimate-accuracy
      // metric meaningless.
      const drift = rng.int(-3, 8);
      const actualTrainingDays = Math.max(1, expectedDays + drift);
      const matchGap = rng.int(3, 10);

      const expectedReturnTraining = addDays(onsetDate, expectedDays);
      const expectedReturnMatch = addDays(
        onsetDate,
        expectedDays + Math.round(matchGap * 0.7),
      );
      const actualReturnTraining = addDays(
        onsetDate,
        actualTrainingDays,
      );
      const actualReturnMatch = addDays(
        onsetDate,
        actualTrainingDays + matchGap,
      );

      // Recurrences cluster in specific regions rather than scattering
      // uniformly across the body.
      const key = `${player.id}:${region}:${side}`;
      const prior = priorByKey.get(key);
      const isRecurrence =
        prior !== undefined &&
        RECURRENCE_PRONE_REGIONS.includes(region) &&
        rng.bool(0.55);

      // A minority of older records were logged pitchside and never
      // completed by medical staff. This is the reality the QUICK
      // completeness state exists to represent.
      const isQuick = rng.bool(0.14);

      const diagnosis = isQuick
        ? null
        : diagnosisFor(region, injuryType);

      const episode: InjuryEpisodeClinical = {
        id,
        clubId: CLUB.id,
        playerId: player.id,
        seasonId: window.seasonId,
        status: statusForResolved(),
        region,
        side,
        injuryType,
        activity,
        surface,
        mechanism: isRecurrence ? "RECURRENCE" : mechanism,
        onsetDate,
        estimatedAbsence: band,
        expectedReturnTraining,
        expectedReturnMatch,
        actualReturnTraining,
        actualReturnMatch,
        clearedDate: actualReturnMatch,
        requiredImmediateSubstitution:
          activity === "MATCH" && rng.bool(0.45),
        completeness: isQuick ? "QUICK" : "COMPLETE",
        isRecurrence,
        previousEpisodeId: isRecurrence ? (prior ?? null) : null,
        bodyMapHint: null,
        reportedByUserId: isQuick
          ? rng.pick([COACH, HEAD_COACH])
          : rng.pick([MEDICAL_STAFF, MEDICAL_LEAD]),
        createdAt: timestamp(onsetDate, rng.int(9, 21)),
        updatedAt: timestamp(actualReturnMatch, 10),
        diagnosis,
        clinicalNotes: null,
        severityGrade: isQuick ? null : grade,
      };

      out.push(episode);
      priorByKey.set(key, id);
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const INJURY_EPISODES: InjuryEpisodeClinical[] = [
  ...HERO_EPISODES,
  ...CURRENT_EPISODES,
  ...generateEpisodes(),
].sort((a, b) => b.onsetDate.localeCompare(a.onsetDate));

/** Episodes with no recorded return, as of DEMO_TODAY. */
export const ACTIVE_EPISODE_IDS: readonly string[] = INJURY_EPISODES
  .filter((e) => e.clearedDate === null)
  .map((e) => e.id);

export { DEMO_TODAY };
