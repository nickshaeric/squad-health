import type { AuthContext } from "@/domain/auth";
import { can } from "@/domain/auth";
import type {
  BodyRegion,
  InjuryActivity,
  InjuryType,
} from "@/domain/types";
import { INJURY_EPISODES } from "@/data/episodes";
import { SEASONS } from "@/data/club";

/**
 * Aggregate analytics.
 *
 * Every figure here is a count or a mean of recorded values. There are
 * deliberately no risk rates, no injury-per-1000-hours figures, and no
 * composite indices, because the platform does not yet capture exposure
 * hours. An incidence rate without a denominator is not a conservative
 * estimate, it is a fabrication, and a club that acts on one will make
 * worse decisions than a club with no number at all.
 *
 * Exposure-based metrics arrive with training-load capture in a later
 * version. Until then, counts.
 */

function scoped(ctx: AuthContext) {
  return INJURY_EPISODES.filter((e) => e.clubId === ctx.clubId);
}

export interface RegionCount {
  region: BodyRegion;
  current: number;
  previous: number;
}

/**
 * Episode counts per body region, current season against the one before.
 *
 * Season-over-season is the comparison a club actually reasons about,
 * and it costs nothing once two seasons exist. A single season offers no
 * comparison axis at all.
 */
export function getRegionCounts(ctx: AuthContext): RegionCount[] {
  const episodes = scoped(ctx);
  const current = SEASONS.find((s) => s.isCurrent)?.id;
  const previous = SEASONS.find((s) => !s.isCurrent)?.id;

  const counts = new Map<BodyRegion, { current: number; previous: number }>();

  for (const episode of episodes) {
    const entry =
      counts.get(episode.region) ?? { current: 0, previous: 0 };
    if (episode.seasonId === current) entry.current += 1;
    if (episode.seasonId === previous) entry.previous += 1;
    counts.set(episode.region, entry);
  }

  return [...counts.entries()]
    .map(([region, entry]) => ({ region, ...entry }))
    .sort((a, b) => b.current + b.previous - (a.current + a.previous));
}

export interface MonthlyCount {
  month: string;
  label: string;
  count: number;
  matchCount: number;
  trainingCount: number;
}

/**
 * Episodes per month across the current season.
 *
 * Split by match and training because the two carry very different
 * exposure per hour, and a spike in one means something different from a
 * spike in the other.
 */
export function getMonthlyCounts(ctx: AuthContext): MonthlyCount[] {
  const season = SEASONS.find((s) => s.isCurrent);
  if (!season) return [];

  const episodes = scoped(ctx).filter(
    (e) => e.seasonId === season.id,
  );

  const buckets = new Map<
    string,
    { count: number; match: number; training: number }
  >();

  for (const episode of episodes) {
    const month = episode.onsetDate.slice(0, 7);
    const entry =
      buckets.get(month) ?? { count: 0, match: 0, training: 0 };
    entry.count += 1;
    if (episode.activity === "MATCH") entry.match += 1;
    if (episode.activity === "TRAINING") entry.training += 1;
    buckets.set(month, entry);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, entry]) => ({
      month,
      label: monthLabel(month),
      count: entry.count,
      matchCount: entry.match,
      trainingCount: entry.training,
    }));
}

export interface TypeCount {
  type: InjuryType;
  count: number;
}

export function getTypeCounts(ctx: AuthContext): TypeCount[] {
  const counts = new Map<InjuryType, number>();

  for (const episode of scoped(ctx)) {
    counts.set(
      episode.injuryType,
      (counts.get(episode.injuryType) ?? 0) + 1,
    );
  }

  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

export interface ActivityCount {
  activity: InjuryActivity;
  count: number;
}

export function getActivityCounts(ctx: AuthContext): ActivityCount[] {
  const counts = new Map<InjuryActivity, number>();

  for (const episode of scoped(ctx)) {
    counts.set(
      episode.activity,
      (counts.get(episode.activity) ?? 0) + 1,
    );
  }

  return [...counts.entries()]
    .map(([activity, count]) => ({ activity, count }))
    .sort((a, b) => b.count - a.count);
}

export interface RecoverySummary {
  region: BodyRegion;
  meanDays: number;
  /**
   * Number of episodes the mean is computed from. Displayed alongside
   * every average: a mean over three episodes and a mean over forty are
   * different kinds of claim, and hiding that difference invites a club
   * to plan against noise.
   */
  sampleSize: number;
}

export function getRecoveryByRegion(
  ctx: AuthContext,
): RecoverySummary[] {
  const groups = new Map<BodyRegion, number[]>();

  for (const episode of scoped(ctx)) {
    if (!episode.actualReturnMatch) continue;
    const days = daysBetween(
      episode.onsetDate,
      episode.actualReturnMatch,
    );
    const list = groups.get(episode.region) ?? [];
    list.push(days);
    groups.set(episode.region, list);
  }

  return [...groups.entries()]
    .map(([region, days]) => ({
      region,
      meanDays: Math.round(
        days.reduce((sum, d) => sum + d, 0) / days.length,
      ),
      sampleSize: days.length,
    }))
    .sort((a, b) => b.meanDays - a.meanDays);
}

export interface EstimateAccuracy {
  withinEstimate: number;
  late: number;
  early: number;
  meanDriftDays: number;
  sampleSize: number;
}

/**
 * How well the club's absence estimates hold up.
 *
 * This is only computable because expected and actual return dates are
 * stored separately rather than the estimate being overwritten on
 * return. A club that systematically underestimates absences plans its
 * squad badly and cannot discover that from either column alone.
 */
export function getEstimateAccuracy(
  ctx: AuthContext,
): EstimateAccuracy {
  const drifts: number[] = [];
  let late = 0;
  let early = 0;
  let onTime = 0;

  for (const episode of scoped(ctx)) {
    if (!episode.expectedReturnMatch || !episode.actualReturnMatch) {
      continue;
    }
    const drift = daysBetween(
      episode.expectedReturnMatch,
      episode.actualReturnMatch,
    );
    drifts.push(drift);
    if (drift > 2) late += 1;
    else if (drift < -2) early += 1;
    else onTime += 1;
  }

  return {
    withinEstimate: onTime,
    late,
    early,
    meanDriftDays:
      drifts.length === 0
        ? 0
        : Math.round(
            (drifts.reduce((sum, d) => sum + d, 0) / drifts.length) *
              10,
          ) / 10,
    sampleSize: drifts.length,
  };
}

export interface RecurrenceSummary {
  totalEpisodes: number;
  recurrences: number;
  /** Regions where recurrence is concentrated, most affected first. */
  byRegion: { region: BodyRegion; count: number }[];
}

export function getRecurrenceSummary(
  ctx: AuthContext,
): RecurrenceSummary {
  const episodes = scoped(ctx);
  const recurrences = episodes.filter((e) => e.isRecurrence);

  const counts = new Map<BodyRegion, number>();
  for (const episode of recurrences) {
    counts.set(
      episode.region,
      (counts.get(episode.region) ?? 0) + 1,
    );
  }

  return {
    totalEpisodes: episodes.length,
    recurrences: recurrences.length,
    byRegion: [...counts.entries()]
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export interface DataQualitySummary {
  total: number;
  complete: number;
  quick: number;
}

/**
 * Record completeness.
 *
 * Surfaced as a first-class figure rather than hidden, because the gap
 * between what was logged pitchside and what a clinician later completed
 * is the main threat to every other number on this page.
 */
export function getDataQuality(
  ctx: AuthContext,
): DataQualitySummary {
  const episodes = scoped(ctx);
  const quick = episodes.filter(
    (e) => e.completeness === "QUICK",
  ).length;

  return {
    total: episodes.length,
    complete: episodes.length - quick,
    quick,
  };
}

/** Whether the caller may export aggregate data. */
export function canExport(ctx: AuthContext): boolean {
  return can(ctx, "report.export.csv");
}

function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00Z`).getTime();
  const b = new Date(`${to}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86400000);
}

function monthLabel(month: string): string {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-GB", {
    month: "short",
    timeZone: "UTC",
  });
}
