import type {
  EpisodeStatus,
  InjuryStatusEvent,
} from "@/domain/types";
import { INJURY_EPISODES } from "./episodes";

/**
 * Append-only status history.
 *
 * The `status` field on an episode is a mutable projection kept for
 * cheap querying. This log is the record of how the episode reached
 * that status, and it is what the Player Profile timeline renders.
 *
 * Nothing here is ever updated or deleted. In production the episode's
 * status column would be derived from the latest event rather than
 * written independently, so the two cannot drift.
 */

function eventsForEpisode(
  episodeId: string,
  onsetDate: string,
  path: readonly EpisodeStatus[],
  actorUserId: string,
  dates: readonly string[],
): InjuryStatusEvent[] {
  const out: InjuryStatusEvent[] = [];
  let from: EpisodeStatus | null = null;

  path.forEach((to, index) => {
    out.push({
      id: `ev-${episodeId}-${index + 1}`,
      episodeId,
      fromStatus: from,
      toStatus: to,
      occurredAt: `${dates[index] ?? onsetDate}T10:00:00.000Z`,
      note: null,
      actorUserId,
    });
    from = to;
  });

  return out;
}

/** Hand-authored history for the hero's current episode. */
const HERO_CURRENT_EVENTS: InjuryStatusEvent[] = [
  {
    id: "ev-hero4-1",
    episodeId: "ep-hero-4",
    fromStatus: null,
    toStatus: "REPORTED",
    occurredAt: "2026-07-12T19:05:00.000Z",
    note: "Withdrawn at half time. Logged pitchside.",
    actorUserId: "user-medical-staff",
  },
  {
    id: "ev-hero4-2",
    episodeId: "ep-hero-4",
    fromStatus: "REPORTED",
    toStatus: "ASSESSED",
    occurredAt: "2026-07-13T09:30:00.000Z",
    note: "Examined next morning. Grade I-II, same site as February.",
    actorUserId: "user-medical-lead",
  },
  {
    id: "ev-hero4-3",
    episodeId: "ep-hero-4",
    fromStatus: "ASSESSED",
    toStatus: "IN_TREATMENT",
    occurredAt: "2026-07-13T11:00:00.000Z",
    note: null,
    actorUserId: "user-medical-staff",
  },
  {
    id: "ev-hero4-4",
    episodeId: "ep-hero-4",
    fromStatus: "IN_TREATMENT",
    toStatus: "IN_REHAB",
    occurredAt: "2026-07-21T10:00:00.000Z",
    note: "Rehabilitation plan opened. Individual training.",
    actorUserId: "user-medical-staff",
  },
];

const RESOLVED_PATH: readonly EpisodeStatus[] = [
  "REPORTED",
  "ASSESSED",
  "IN_TREATMENT",
  "IN_REHAB",
  "RETURNED_TRAINING",
  "RETURNED_MATCH",
  "CLEARED",
];

const QUICK_PATH: readonly EpisodeStatus[] = ["REPORTED"];

/**
 * Events for every episode other than the hero's current one, derived
 * from the dates already on the episode so the log and the projection
 * agree.
 */
function derivedEvents(): InjuryStatusEvent[] {
  const out: InjuryStatusEvent[] = [];

  for (const episode of INJURY_EPISODES) {
    if (episode.id === "ep-hero-4") continue;

    if (episode.completeness === "QUICK" && !episode.clearedDate) {
      out.push(
        ...eventsForEpisode(
          episode.id,
          episode.onsetDate,
          QUICK_PATH,
          episode.reportedByUserId,
          [episode.onsetDate],
        ),
      );
      continue;
    }

    if (!episode.clearedDate) {
      // Active but not quick: reported through to current status.
      const index = RESOLVED_PATH.indexOf(episode.status);
      const path = RESOLVED_PATH.slice(0, Math.max(1, index + 1));
      out.push(
        ...eventsForEpisode(
          episode.id,
          episode.onsetDate,
          path,
          episode.reportedByUserId,
          path.map((_, i) =>
            i === 0 ? episode.onsetDate : episode.onsetDate,
          ),
        ),
      );
      continue;
    }

    out.push(
      ...eventsForEpisode(
        episode.id,
        episode.onsetDate,
        RESOLVED_PATH,
        episode.reportedByUserId,
        [
          episode.onsetDate,
          episode.onsetDate,
          episode.onsetDate,
          episode.onsetDate,
          episode.actualReturnTraining ?? episode.onsetDate,
          episode.actualReturnMatch ?? episode.onsetDate,
          episode.clearedDate,
        ],
      ),
    );
  }

  return out;
}

export const INJURY_STATUS_EVENTS: InjuryStatusEvent[] = [
  ...HERO_CURRENT_EVENTS,
  ...derivedEvents(),
];
