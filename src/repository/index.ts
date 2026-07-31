import {
  can,
  hasClinicalAccess,
  type AuthContext,
} from "@/domain/auth";
import {
  projectEpisode,
  projectEpisodes,
} from "@/domain/projections";
import type {
  AvailabilityBlock,
  AvailabilityStatus,
  InjuryEpisodeAvailability,
  InjuryEpisodeClinical,
  InjuryStatusEvent,
  PainAssessment,
  Player,
  RehabPlan,
  RehabStage,
  RehabStageProgress,
  UnavailabilityReason,
} from "@/domain/types";
import { AVAILABILITY_BLOCKS } from "@/data/availability";
import { PAIN_ASSESSMENTS } from "@/data/assessments";
import { CLUB, CURRENT_SEASON, DEMO_TODAY, SEASONS } from "@/data/club";
import { INJURY_EPISODES } from "@/data/episodes";
import { INJURY_STATUS_EVENTS } from "@/data/events";
import { PLAYERS } from "@/data/players";
import { REHAB_PLANS, REHAB_STAGE_PROGRESS } from "@/data/rehab";

/**
 * Repository layer.
 *
 * Every read takes an AuthContext and applies the capability matrix
 * before returning. Components never see the raw seed arrays, so a
 * component cannot accidentally render a diagnosis to a coach: the
 * clinical keys are not present on the object it receives.
 *
 * For the demo these are synchronous functions over in-memory data. The
 * signatures are deliberately shaped like async database queries so the
 * call sites survive the move to Drizzle and Postgres: the tenant scope
 * and the capability check are already here, and only the body of each
 * function changes.
 */

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class ForbiddenError extends Error {
  constructor(capability: string) {
    super(`Missing capability: ${capability}`);
    this.name = "ForbiddenError";
  }
}

function require_(ctx: AuthContext, capability: Parameters<typeof can>[1]) {
  if (!can(ctx, capability)) {
    throw new ForbiddenError(capability);
  }
}

// ---------------------------------------------------------------------------
// Tenant scoping
//
// Every query filters on clubId even though the demo has one club. The
// filter is what production RLS will enforce at the database level, and
// writing it now means no query has to be revisited later.
// ---------------------------------------------------------------------------

function inClub<T extends { clubId: string }>(
  ctx: AuthContext,
  rows: readonly T[],
): T[] {
  return rows.filter((row) => row.clubId === ctx.clubId);
}

// ---------------------------------------------------------------------------
// Club and season
// ---------------------------------------------------------------------------

export function getClub(ctx: AuthContext) {
  return ctx.clubId === CLUB.id ? CLUB : undefined;
}

export function getSeasons(ctx: AuthContext) {
  return inClub(ctx, SEASONS);
}

export function getCurrentSeason(ctx: AuthContext) {
  return ctx.clubId === CLUB.id ? CURRENT_SEASON : undefined;
}

export function today(): string {
  return DEMO_TODAY;
}

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

export function getPlayers(ctx: AuthContext): Player[] {
  require_(ctx, "player.read.basic");
  return inClub(ctx, PLAYERS).sort(
    (a, b) => a.shirtNumber - b.shirtNumber,
  );
}

export function getPlayer(
  ctx: AuthContext,
  playerId: string,
): Player | undefined {
  require_(ctx, "player.read.basic");
  return inClub(ctx, PLAYERS).find((p) => p.id === playerId);
}

// ---------------------------------------------------------------------------
// Availability
//
// This is the coach-facing path and it resolves entirely from
// availability_blocks. It never reads the injury tables, which is the
// structural reason a coach cannot leak a diagnosis through this route
// rather than merely a policy reason.
// ---------------------------------------------------------------------------

export interface PlayerAvailability {
  playerId: string;
  status: AvailabilityStatus;
  reason: UnavailabilityReason | null;
  /** Body region, if the cause is an injury. Not a diagnosis. */
  region: string | null;
  expectedReturnTraining: string | null;
  expectedReturnMatch: string | null;
  matchesRemaining: number | null;
  note: string | null;
  /** Present only for callers holding rehab.read. */
  rehabStage: RehabStage | null;
}

function activeBlocks(ctx: AuthContext): AvailabilityBlock[] {
  const now = today();
  return inClub(ctx, AVAILABILITY_BLOCKS).filter((block) => {
    if (block.startsOn > now) return false;
    if (block.endsOn === null) return true;
    return block.endsOn >= now;
  });
}

/**
 * Squad availability as of today.
 *
 * A player with no active block is available. Region and rehab stage are
 * attached only where the caller holds the relevant capability, and the
 * region is a coarse body area rather than any clinical detail.
 */
export function getSquadAvailability(
  ctx: AuthContext,
): PlayerAvailability[] {
  require_(ctx, "availability.read");

  const players = getPlayers(ctx);
  const blocks = activeBlocks(ctx);
  const showRehab = can(ctx, "rehab.read");

  return players.map((player) => {
    const block = blocks.find((b) => b.playerId === player.id);

    if (!block) {
      return {
        playerId: player.id,
        status: "AVAILABLE" as const,
        reason: null,
        region: null,
        expectedReturnTraining: null,
        expectedReturnMatch: null,
        matchesRemaining: null,
        note: null,
        rehabStage: null,
      };
    }

    const episode = block.episodeId
      ? INJURY_EPISODES.find((e) => e.id === block.episodeId)
      : undefined;

    const plan = episode
      ? REHAB_PLANS.find((p) => p.episodeId === episode.id)
      : undefined;

    // A player in team training is fit enough to train but not yet
    // cleared for selection. Doubtful rather than unavailable is the
    // honest answer to the coach's question.
    const status: AvailabilityStatus =
      plan?.currentStage === "TEAM_TRAINING" ||
      plan?.currentStage === "MEDICAL_TEST"
        ? "DOUBTFUL"
        : "UNAVAILABLE";

    return {
      playerId: player.id,
      status,
      reason: block.reason,
      region: episode ? episode.region : null,
      expectedReturnTraining: episode?.expectedReturnTraining ?? null,
      expectedReturnMatch:
        episode?.expectedReturnMatch ?? block.endsOn ?? null,
      matchesRemaining: block.matchesRemaining,
      note: block.nonClinicalNote,
      rehabStage: showRehab ? (plan?.currentStage ?? null) : null,
    };
  });
}

export function getPlayerAvailability(
  ctx: AuthContext,
  playerId: string,
): PlayerAvailability | undefined {
  return getSquadAvailability(ctx).find((a) => a.playerId === playerId);
}

// ---------------------------------------------------------------------------
// Injury episodes
//
// Return type is the union. Callers holding injury.read.clinical get the
// clinical shape; everyone else gets objects with the clinical keys
// absent. Use isClinical() from domain/projections to narrow.
// ---------------------------------------------------------------------------

type Episode = InjuryEpisodeAvailability | InjuryEpisodeClinical;

export function getEpisodes(
  ctx: AuthContext,
  options: { seasonId?: string } = {},
): Episode[] {
  require_(ctx, "injury.read.availability");

  let rows = inClub(ctx, INJURY_EPISODES);

  if (options.seasonId) {
    rows = rows.filter((e) => e.seasonId === options.seasonId);
  }

  return projectEpisodes(ctx, rows);
}

export function getEpisode(
  ctx: AuthContext,
  episodeId: string,
): Episode | undefined {
  require_(ctx, "injury.read.availability");

  const row = inClub(ctx, INJURY_EPISODES).find(
    (e) => e.id === episodeId,
  );

  return row ? projectEpisode(ctx, row) : undefined;
}

export function getPlayerEpisodes(
  ctx: AuthContext,
  playerId: string,
): Episode[] {
  require_(ctx, "injury.read.availability");

  const rows = inClub(ctx, INJURY_EPISODES).filter(
    (e) => e.playerId === playerId,
  );

  return projectEpisodes(ctx, rows);
}

export function getActiveEpisodes(ctx: AuthContext): Episode[] {
  require_(ctx, "injury.read.availability");

  const rows = inClub(ctx, INJURY_EPISODES).filter(
    (e) => e.clearedDate === null,
  );

  return projectEpisodes(ctx, rows);
}

/**
 * The recurrence chain for an episode, oldest first.
 *
 * Follows previousEpisodeId backwards. This is what makes a repeated
 * injury legible as a pattern rather than as three unrelated entries in
 * a list.
 */
export function getRecurrenceChain(
  ctx: AuthContext,
  episodeId: string,
): Episode[] {
  require_(ctx, "injury.read.availability");

  const chain: InjuryEpisodeClinical[] = [];
  let cursor: string | null = episodeId;
  const seen = new Set<string>();

  while (cursor && !seen.has(cursor)) {
    seen.add(cursor);
    const row = INJURY_EPISODES.find(
      (e) => e.id === cursor && e.clubId === ctx.clubId,
    );
    if (!row) break;
    chain.unshift(row);
    cursor = row.previousEpisodeId;
  }

  return projectEpisodes(ctx, chain);
}

// ---------------------------------------------------------------------------
// Status history
// ---------------------------------------------------------------------------

export function getStatusEvents(
  ctx: AuthContext,
  episodeId: string,
): InjuryStatusEvent[] {
  require_(ctx, "injury.read.availability");

  // Scope through the parent episode; events carry no clubId of their own
  // in the demo schema.
  const episode = inClub(ctx, INJURY_EPISODES).find(
    (e) => e.id === episodeId,
  );
  if (!episode) return [];

  return INJURY_STATUS_EVENTS.filter(
    (e) => e.episodeId === episodeId,
  ).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
}

// ---------------------------------------------------------------------------
// Pain assessments — clinical
// ---------------------------------------------------------------------------

export function getPainAssessments(
  ctx: AuthContext,
  episodeId: string,
): PainAssessment[] {
  require_(ctx, "assessment.read");

  const episode = inClub(ctx, INJURY_EPISODES).find(
    (e) => e.id === episodeId,
  );
  if (!episode) return [];

  return PAIN_ASSESSMENTS.filter((a) => a.episodeId === episodeId).sort(
    (a, b) => a.assessedOn.localeCompare(b.assessedOn),
  );
}

// ---------------------------------------------------------------------------
// Rehabilitation
//
// Stage and progress are visible to coaching roles holding rehab.read,
// because "he is in team training" is availability information. The
// notes attached to each stage are not clinical findings, but production
// should review that assumption with a clinician before shipping.
// ---------------------------------------------------------------------------

export interface RehabView {
  plan: RehabPlan;
  progress: RehabStageProgress[];
  /** Zero-based index of the current stage in REHAB_STAGES. */
  stageIndex: number;
  totalStages: number;
}

export function getRehabForEpisode(
  ctx: AuthContext,
  episodeId: string,
): RehabView | undefined {
  require_(ctx, "rehab.read");

  const plan = inClub(ctx, REHAB_PLANS).find(
    (p) => p.episodeId === episodeId,
  );
  if (!plan) return undefined;

  const progress = REHAB_STAGE_PROGRESS.filter(
    (p) => p.planId === plan.id,
  ).sort((a, b) => a.enteredOn.localeCompare(b.enteredOn));

  const stages = [
    "FIRST_TREATMENT",
    "FOLLOW_UP_EXAM",
    "INDIVIDUAL_TRAINING",
    "TEAM_TRAINING",
    "MEDICAL_TEST",
    "MATCH_READY",
  ] as const;

  return {
    plan,
    progress,
    stageIndex: stages.indexOf(plan.currentStage),
    totalStages: stages.length,
  };
}

// ---------------------------------------------------------------------------
// Capability surface for the UI
// ---------------------------------------------------------------------------

/**
 * What the current context is allowed to see, as flags rather than role
 * comparisons. Screens branch on these so that adding or restructuring
 * roles does not require touching components.
 */
export function getViewCapabilities(ctx: AuthContext) {
  return {
    clinical: hasClinicalAccess(ctx.role),
    rehab: can(ctx, "rehab.read"),
    assessments: can(ctx, "assessment.read"),
    contact: can(ctx, "player.read.contact"),
    treatmentSchedule: can(ctx, "treatment.read.schedule"),
    treatmentClinical: can(ctx, "treatment.read.clinical"),
    exportCsv: can(ctx, "report.export.csv"),
    clinicalReports: can(ctx, "report.clinical.generate"),
    createQuick: can(ctx, "injury.create.quick"),
    writeClinical: can(ctx, "injury.write.clinical"),
    advanceEarlyStage: can(ctx, "rehab.stage.advance.early"),
    advanceMedicalStage: can(ctx, "rehab.stage.advance.medical"),
    audit: can(ctx, "audit.read"),
  };
}

export type ViewCapabilities = ReturnType<typeof getViewCapabilities>;
