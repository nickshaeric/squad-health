import type { RehabPlan, RehabStageProgress } from "@/domain/types";
import { CLUB } from "./club";

/**
 * Rehabilitation plans and stage progress.
 *
 * Six stages. Stages 5 and 6 (medical test, match ready) require the
 * medical lead's approval; a physiotherapist can advance a player to
 * team training but cannot declare him match ready. `approvedByUserId`
 * records who signed each stage off, which is the audit trail that
 * makes the gate meaningful rather than decorative.
 */

const MEDICAL_LEAD = "user-medical-lead";
const MEDICAL_STAFF = "user-medical-staff";

export const REHAB_PLANS: RehabPlan[] = [
  {
    id: "plan-hero-4",
    clubId: CLUB.id,
    episodeId: "ep-hero-4",
    currentStage: "INDIVIDUAL_TRAINING",
    startedOn: "2026-07-13",
    targetCompletionOn: "2026-08-16",
    completedOn: null,
  },
  {
    id: "plan-cur-1",
    clubId: CLUB.id,
    episodeId: "ep-cur-1",
    currentStage: "FIRST_TREATMENT",
    startedOn: "2026-07-20",
    targetCompletionOn: "2026-09-20",
    completedOn: null,
  },
  {
    id: "plan-cur-2",
    clubId: CLUB.id,
    episodeId: "ep-cur-2",
    currentStage: "TEAM_TRAINING",
    startedOn: "2026-07-07",
    targetCompletionOn: "2026-08-03",
    completedOn: null,
  },
  {
    id: "plan-hero-3",
    clubId: CLUB.id,
    episodeId: "ep-hero-3",
    currentStage: "MATCH_READY",
    startedOn: "2026-02-12",
    targetCompletionOn: "2026-03-07",
    completedOn: "2026-03-21",
  },
];

export const REHAB_STAGE_PROGRESS: RehabStageProgress[] = [
  // Hero, current episode. Sitting at individual training, which is
  // where the isokinetic assessment gates further progress.
  {
    id: "rsp-h4-1",
    planId: "plan-hero-4",
    stage: "FIRST_TREATMENT",
    enteredOn: "2026-07-13",
    completedOn: "2026-07-17",
    approvedByUserId: MEDICAL_STAFF,
    note: "Acute management complete.",
  },
  {
    id: "rsp-h4-2",
    planId: "plan-hero-4",
    stage: "FOLLOW_UP_EXAM",
    enteredOn: "2026-07-17",
    completedOn: "2026-07-21",
    approvedByUserId: MEDICAL_LEAD,
    note: "Grade confirmed as I-II. No imaging repeat required.",
  },
  {
    id: "rsp-h4-3",
    planId: "plan-hero-4",
    stage: "INDIVIDUAL_TRAINING",
    enteredOn: "2026-07-21",
    completedOn: null,
    approvedByUserId: MEDICAL_STAFF,
    note:
      "Held at this stage pending isokinetic assessment. Progression " +
      "to team training will not be authorised on symptoms alone " +
      "given the recurrence history.",
  },

  // player-05, MCL. Early, braced.
  {
    id: "rsp-c1-1",
    planId: "plan-cur-1",
    stage: "FIRST_TREATMENT",
    enteredOn: "2026-07-20",
    completedOn: null,
    approvedByUserId: MEDICAL_LEAD,
    note: "Braced four weeks. Protected range.",
  },

  // player-18, adductor. Furthest along; next stage needs the lead.
  {
    id: "rsp-c2-1",
    planId: "plan-cur-2",
    stage: "FIRST_TREATMENT",
    enteredOn: "2026-07-07",
    completedOn: "2026-07-11",
    approvedByUserId: MEDICAL_STAFF,
    note: null,
  },
  {
    id: "rsp-c2-2",
    planId: "plan-cur-2",
    stage: "FOLLOW_UP_EXAM",
    enteredOn: "2026-07-11",
    completedOn: "2026-07-16",
    approvedByUserId: MEDICAL_LEAD,
    note: "Low grade confirmed.",
  },
  {
    id: "rsp-c2-3",
    planId: "plan-cur-2",
    stage: "INDIVIDUAL_TRAINING",
    enteredOn: "2026-07-16",
    completedOn: "2026-07-24",
    approvedByUserId: MEDICAL_STAFF,
    note: "All planes, no symptoms.",
  },
  {
    id: "rsp-c2-4",
    planId: "plan-cur-2",
    stage: "TEAM_TRAINING",
    enteredOn: "2026-07-24",
    completedOn: null,
    approvedByUserId: MEDICAL_STAFF,
    note:
      "Full team training from 24/07. Medical test requires the club " +
      "doctor's sign-off before matchday consideration.",
  },

  // Hero, February episode. Complete, showing the gated stages signed
  // by the medical lead rather than the physiotherapist.
  {
    id: "rsp-h3-1",
    planId: "plan-hero-3",
    stage: "FIRST_TREATMENT",
    enteredOn: "2026-02-12",
    completedOn: "2026-02-17",
    approvedByUserId: MEDICAL_STAFF,
    note: null,
  },
  {
    id: "rsp-h3-2",
    planId: "plan-hero-3",
    stage: "FOLLOW_UP_EXAM",
    enteredOn: "2026-02-17",
    completedOn: "2026-02-23",
    approvedByUserId: MEDICAL_LEAD,
    note: "Re-injury at previous scar site confirmed.",
  },
  {
    id: "rsp-h3-3",
    planId: "plan-hero-3",
    stage: "INDIVIDUAL_TRAINING",
    enteredOn: "2026-02-23",
    completedOn: "2026-03-06",
    approvedByUserId: MEDICAL_STAFF,
    note: "Extended by one week versus protocol.",
  },
  {
    id: "rsp-h3-4",
    planId: "plan-hero-3",
    stage: "TEAM_TRAINING",
    enteredOn: "2026-03-06",
    completedOn: "2026-03-13",
    approvedByUserId: MEDICAL_STAFF,
    note: null,
  },
  {
    id: "rsp-h3-5",
    planId: "plan-hero-3",
    stage: "MEDICAL_TEST",
    enteredOn: "2026-03-13",
    completedOn: "2026-03-18",
    approvedByUserId: MEDICAL_LEAD,
    note: "Eccentric deficit 6%. Acceptable for return.",
  },
  {
    id: "rsp-h3-6",
    planId: "plan-hero-3",
    stage: "MATCH_READY",
    enteredOn: "2026-03-18",
    completedOn: "2026-03-21",
    approvedByUserId: MEDICAL_LEAD,
    note: "Cleared for selection 21/03.",
  },
];
