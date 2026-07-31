import type { AvailabilityBlock } from "@/domain/types";
import { CLUB } from "./club";
import { INJURY_EPISODES } from "./episodes";

/**
 * Availability blocks.
 *
 * Injury is one cause of unavailability among several, and a coach's
 * actual question is "who can be selected on Saturday". Answering it
 * from injury data alone is wrong: a suspended player is fit and
 * unavailable, and a coach who queries the injury table will pick him.
 *
 * Coach-facing availability reads must resolve entirely from this table
 * so that clinical tables are never touched on that path. `episodeId`
 * links back only for medical roles that already hold clinical access.
 */

const NON_INJURY_BLOCKS: AvailabilityBlock[] = [
  {
    id: "block-susp-1",
    clubId: CLUB.id,
    playerId: "player-03",
    reason: "SUSPENSION",
    episodeId: null,
    startsOn: "2026-07-26",
    endsOn: null,
    matchesRemaining: 2,
    nonClinicalNote:
      "Red card, serious foul play, 26/07. Two further matches.",
  },
  {
    id: "block-intl-1",
    clubId: CLUB.id,
    playerId: "player-15",
    reason: "INTERNATIONAL_DUTY",
    episodeId: null,
    startsOn: "2026-07-27",
    endsOn: "2026-08-05",
    matchesRemaining: null,
    nonClinicalNote: "U21 qualifiers, called up 27/07 to 05/08.",
  },
  {
    id: "block-ill-1",
    clubId: CLUB.id,
    playerId: "player-21",
    reason: "ILLNESS",
    episodeId: null,
    startsOn: "2026-07-28",
    endsOn: "2026-07-31",
    matchesRemaining: null,
    nonClinicalNote:
      "Reported unwell 28/07. Not training. Review Friday.",
  },
  {
    id: "block-reg-1",
    clubId: CLUB.id,
    playerId: "player-25",
    reason: "NOT_REGISTERED",
    episodeId: null,
    startsOn: "2026-01-06",
    endsOn: null,
    matchesRemaining: null,
    nonClinicalNote:
      "International transfer certificate outstanding. Cannot be " +
      "named in a matchday squad until registration completes.",
  },
];

/**
 * Injury-derived blocks are generated from the episodes themselves so
 * the two can never disagree. In production this would be maintained by
 * the same transaction that writes the episode.
 */
function blocksFromEpisodes(): AvailabilityBlock[] {
  return INJURY_EPISODES.filter((e) => e.clearedDate === null).map(
    (episode) => ({
      id: `block-inj-${episode.id}`,
      clubId: episode.clubId,
      playerId: episode.playerId,
      reason: "INJURY" as const,
      episodeId: episode.id,
      startsOn: episode.onsetDate,
      endsOn: episode.expectedReturnMatch,
      matchesRemaining: null,
      // Deliberately non-clinical. This string is visible to coaching
      // and administrative roles, so it carries body region and timing
      // but never a diagnosis.
      nonClinicalNote: null,
    }),
  );
}

export const AVAILABILITY_BLOCKS: AvailabilityBlock[] = [
  ...blocksFromEpisodes(),
  ...NON_INJURY_BLOCKS,
];
