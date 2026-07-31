import { can, type AuthContext } from "./auth";
import type {
  InjuryEpisodeAvailability,
  InjuryEpisodeClinical,
} from "./types";

/**
 * Strip clinical fields from a full episode record.
 *
 * Returns a value whose clinical keys are absent, not null. A caller
 * without `injury.read.clinical` cannot distinguish "no diagnosis
 * recorded" from "not permitted to see the diagnosis", and cannot
 * accidentally serialise a null clinical field to the client.
 */
export function toAvailabilityProjection(
  episode: InjuryEpisodeClinical,
): InjuryEpisodeAvailability {
  const {
    diagnosis: _diagnosis,
    clinicalNotes: _clinicalNotes,
    severityGrade: _severityGrade,
    ...availability
  } = episode;

  return availability;
}

/**
 * Project an episode according to the caller's capabilities.
 *
 * This is the single place a clinical field may reach a consumer. All
 * repository reads must pass through it.
 */
export function projectEpisode(
  ctx: AuthContext,
  episode: InjuryEpisodeClinical,
): InjuryEpisodeAvailability | InjuryEpisodeClinical {
  return can(ctx, "injury.read.clinical")
    ? episode
    : toAvailabilityProjection(episode);
}

export function projectEpisodes(
  ctx: AuthContext,
  episodes: readonly InjuryEpisodeClinical[],
): (InjuryEpisodeAvailability | InjuryEpisodeClinical)[] {
  return episodes.map((e) => projectEpisode(ctx, e));
}

/**
 * Narrowing helper for components. Prefer this over checking the role,
 * so the type system and the permission check agree.
 */
export function isClinical(
  episode: InjuryEpisodeAvailability | InjuryEpisodeClinical,
): episode is InjuryEpisodeClinical {
  return "diagnosis" in episode;
}
