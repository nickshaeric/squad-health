"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { AvailabilityBadge } from "@/components/availability-badge";
import { BodyMap, SeverityLegend, type BodyMarker } from "@/components/body-map";
import { PainChart } from "@/components/pain-chart";
import { RehabProgress } from "@/components/rehab-progress";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { userName } from "@/data/club";
import {
  ABSENCE_BAND_LABELS,
  ACTIVITY_LABELS,
  COMPLETENESS_LABELS,
  formatBodyLocation,
  MECHANISM_LABELS,
  POSITION_LABELS,
  SEVERITY_GRADE_LABELS,
  STATUS_LABELS,
  SURFACE_LABELS,
  INJURY_TYPE_LABELS,
} from "@/domain/labels";
import { isClinical } from "@/domain/projections";
import {
  severityFromAbsence,
  severityFromGrade,
} from "@/domain/severity";
import type { BodyRegion, BodySide } from "@/domain/types";
import {
  getPainAssessments,
  getPlayer,
  getPlayerAvailability,
  getPlayerEpisodes,
  getRecurrenceChain,
  getRehabForEpisode,
  getStatusEvents,
  getViewCapabilities,
  today,
} from "@/repository";
import { useAuthContext } from "@/lib/role-context";

export default function PlayerProfilePage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = use(params);
  const ctx = useAuthContext();
  const caps = getViewCapabilities(ctx);

  const player = getPlayer(ctx, playerId);
  if (!player) notFound();

  const availability = getPlayerAvailability(ctx, playerId);
  const episodes = getPlayerEpisodes(ctx, playerId).sort((a, b) =>
    b.onsetDate.localeCompare(a.onsetDate),
  );

  const active = episodes.filter((e) => e.clearedDate === null);
  const resolved = episodes.filter((e) => e.clearedDate !== null);

  const [selectedId, setSelectedId] = useState<string | null>(
    active[0]?.id ?? episodes[0]?.id ?? null,
  );

  const selected = episodes.find((e) => e.id === selectedId) ?? null;

  /**
   * Markers for the body map. Active episodes render at full opacity;
   * resolved ones are dimmed, so a body carrying a long history still
   * shows where the current problem is.
   *
   * Severity is derived from tissue grade where the caller has clinical
   * access and from the absence band otherwise, so a coach sees a
   * sensibly coloured map without receiving a clinical assessment.
   */
  const markers: BodyMarker[] = useMemo(
    () =>
      episodes.map((episode) => {
        const severity = isClinical(episode)
          ? severityFromGrade(episode.severityGrade)
          : severityFromAbsence(episode.estimatedAbsence);

        return {
          region: episode.region,
          side: episode.side,
          severity,
          historical: episode.clearedDate !== null,
          label: isClinical(episode)
            ? (episode.diagnosis ?? INJURY_TYPE_LABELS[episode.injuryType])
            : INJURY_TYPE_LABELS[episode.injuryType],
        };
      }),
    [episodes],
  );

  const chain = selected
    ? getRecurrenceChain(ctx, selected.id)
    : [];

  const rehab =
    selected && caps.rehab
      ? getRehabForEpisode(ctx, selected.id)
      : undefined;

  const assessments =
    selected && caps.assessments
      ? getPainAssessments(ctx, selected.id)
      : [];

  const events = selected ? getStatusEvents(ctx, selected.id) : [];

  function selectRegion(region: BodyRegion, side: BodySide) {
    const match = episodes.find(
      (e) => e.region === region && e.side === side,
    );
    if (match) setSelectedId(match.id);
  }

  return (
    <div className="space-y-6">
      <Link
        href="/squad"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" />
        Squad
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {player.firstName} {player.lastName}
            </h1>
            <span className="text-muted-foreground text-lg tabular-nums">
              {player.shirtNumber}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            {POSITION_LABELS[player.position]}
            {player.secondaryPosition
              ? ` · also ${POSITION_LABELS[player.secondaryPosition]}`
              : ""}{" "}
            · {age(player.dateOfBirth)} years ·{" "}
            {player.preferredFoot === "BOTH"
              ? "Two-footed"
              : `${player.preferredFoot === "LEFT" ? "Left" : "Right"}-footed`}
          </p>
        </div>

        {availability ? (
          <div className="space-y-1 text-right">
            <AvailabilityBadge status={availability.status} />
            {availability.expectedReturnMatch ? (
              <p className="text-muted-foreground text-xs">
                Expected {formatDate(availability.expectedReturnMatch)}
              </p>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Injury history</CardTitle>
            <CardDescription>
              {episodes.length === 0
                ? "No recorded episodes."
                : `${episodes.length} recorded ${
                    episodes.length === 1 ? "episode" : "episodes"
                  }. Resolved injuries are shown dimmed.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <BodyMap
              markers={markers}
              onSelect={selectRegion}
              selected={
                selected
                  ? { region: selected.region, side: selected.side }
                  : null
              }
            />
            <SeverityLegend />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Episodes</CardTitle>
            <CardDescription>
              Select an episode to view its detail.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 px-3">
            {episodes.length === 0 ? (
              <p className="text-muted-foreground px-3 py-6 text-sm">
                This player has no recorded injuries.
              </p>
            ) : (
              episodes.map((episode) => {
                const isSelected = episode.id === selectedId;

                return (
                  <button
                    key={episode.id}
                    type="button"
                    onClick={() => setSelectedId(episode.id)}
                    className={`w-full rounded-md px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-medium">
                        {formatBodyLocation(episode.region, episode.side)}
                        <span className="text-muted-foreground ml-2 font-normal">
                          {INJURY_TYPE_LABELS[episode.injuryType]}
                        </span>
                      </p>
                      <p className="text-muted-foreground shrink-0 text-xs tabular-nums">
                        {formatDate(episode.onsetDate)}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-muted-foreground text-xs">
                        {STATUS_LABELS[episode.status]}
                      </span>
                      {episode.isRecurrence ? (
                        <Badge
                          variant="outline"
                          className="border-severity-severe/30 text-severity-severe text-xs"
                        >
                          Recurrence
                        </Badge>
                      ) : null}
                      {episode.completeness === "QUICK" ? (
                        <Badge
                          variant="outline"
                          className="border-severity-moderate/30 text-severity-moderate text-xs"
                        >
                          Incomplete
                        </Badge>
                      ) : null}
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {selected ? (
        <>
          {chain.length > 1 ? (
            <Card className="border-severity-severe/30">
              <CardHeader>
                <CardTitle className="text-base">
                  Recurrence pattern
                </CardTitle>
                <CardDescription>
                  {chain.length} episodes at the same site. The pattern,
                  rather than any single episode, is the clinical concern.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {chain.map((episode, index) => (
                    <li
                      key={episode.id}
                      className="flex items-baseline gap-3"
                    >
                      <span className="text-muted-foreground w-5 shrink-0 text-xs tabular-nums">
                        {index + 1}.
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">
                          {formatDate(episode.onsetDate)} ·{" "}
                          {ACTIVITY_LABELS[episode.activity]} ·{" "}
                          {MECHANISM_LABELS[episode.mechanism]}
                        </p>
                        {isClinical(episode) && episode.diagnosis ? (
                          <p className="text-muted-foreground text-xs">
                            {episode.diagnosis}
                          </p>
                        ) : null}
                      </div>
                      <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                        {episode.actualReturnMatch
                          ? `${daysBetween(
                              episode.onsetDate,
                              episode.actualReturnMatch,
                            )} days out`
                          : "Ongoing"}
                      </span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Episode detail
                </CardTitle>
                <CardDescription>
                  {formatBodyLocation(selected.region, selected.side)} ·{" "}
                  {COMPLETENESS_LABELS[selected.completeness]}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field
                  label="Onset"
                  value={formatDate(selected.onsetDate)}
                />
                <Field
                  label="Activity"
                  value={`${ACTIVITY_LABELS[selected.activity]} · ${
                    SURFACE_LABELS[selected.surface]
                  }`}
                />
                <Field
                  label="Mechanism"
                  value={MECHANISM_LABELS[selected.mechanism]}
                />
                <Field
                  label="Estimated absence"
                  value={
                    selected.estimatedAbsence
                      ? ABSENCE_BAND_LABELS[selected.estimatedAbsence]
                      : "Not estimated"
                  }
                />
                <Field
                  label="Expected return to match"
                  value={
                    selected.expectedReturnMatch
                      ? formatDate(selected.expectedReturnMatch)
                      : "Not estimated"
                  }
                />
                {selected.actualReturnMatch ? (
                  <Field
                    label="Actual return to match"
                    value={`${formatDate(selected.actualReturnMatch)}${estimateDrift(
                      selected.expectedReturnMatch,
                      selected.actualReturnMatch,
                    )}`}
                  />
                ) : null}
                <Field
                  label="Reported by"
                  value={userName(selected.reportedByUserId)}
                />

                <Separator />

                {isClinical(selected) ? (
                  <>
                    <Field
                      label="Diagnosis"
                      value={selected.diagnosis ?? "Not recorded"}
                    />
                    <Field
                      label="Severity"
                      value={
                        selected.severityGrade
                          ? SEVERITY_GRADE_LABELS[selected.severityGrade]
                          : "Not graded"
                      }
                    />
                    {selected.clinicalNotes ? (
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-medium">
                          Clinical notes
                        </p>
                        <p className="max-w-prose text-sm leading-relaxed">
                          {selected.clinicalNotes}
                        </p>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="text-muted-foreground flex items-start gap-2 text-sm">
                    <Lock className="mt-0.5 size-4 shrink-0" />
                    <p className="max-w-prose leading-snug">
                      Diagnosis and clinical notes are restricted to
                      medical staff. Body region, expected return, and
                      rehabilitation stage are shown above.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {rehab ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Rehabilitation
                    </CardTitle>
                    <CardDescription>
                      Stage {rehab.stageIndex + 1} of{" "}
                      {rehab.totalStages}
                      {rehab.plan.completedOn
                        ? ` · completed ${formatDate(
                            rehab.plan.completedOn,
                          )}`
                        : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RehabProgress
                      currentStage={rehab.plan.currentStage}
                      progress={rehab.progress}
                    />
                  </CardContent>
                </Card>
              ) : null}

              {caps.assessments && assessments.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Pain and function
                    </CardTitle>
                    <CardDescription>
                      {assessments.length} assessments. Pain under load
                      resolves later than pain at rest.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PainChart assessments={assessments} />
                  </CardContent>
                </Card>
              ) : null}

              {events.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Timeline</CardTitle>
                    <CardDescription>
                      Append-only status history.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3">
                      {events.map((event) => (
                        <li key={event.id} className="flex gap-3">
                          <span className="bg-border mt-1.5 size-1.5 shrink-0 rounded-full" />
                          <div className="min-w-0">
                            <p className="text-sm">
                              {STATUS_LABELS[event.toStatus]}
                              <span className="text-muted-foreground ml-2 text-xs tabular-nums">
                                {formatDate(
                                  event.occurredAt.slice(0, 10),
                                )}
                              </span>
                            </p>
                            {event.note ? (
                              <p className="text-muted-foreground text-xs leading-snug">
                                {event.note}
                              </p>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <p className="text-muted-foreground shrink-0 text-xs font-medium">
        {label}
      </p>
      <p className="text-right text-sm">{value}</p>
    </div>
  );
}

/**
 * Difference between the estimate and the outcome. Shown because the
 * gap is the interesting number: a club that consistently underestimates
 * absences plans badly, and it cannot know that without keeping both.
 */
function estimateDrift(
  expected: string | null,
  actual: string | null,
): string {
  if (!expected || !actual) return "";
  const days = daysBetween(expected, actual);
  if (days === 0) return " (on estimate)";
  return days > 0
    ? ` (${days} days later than estimated)`
    : ` (${Math.abs(days)} days earlier than estimated)`;
}

function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00Z`).getTime();
  const b = new Date(`${to}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86400000);
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function age(dateOfBirth: string): number {
  const dob = new Date(`${dateOfBirth}T00:00:00Z`);
  const now = new Date(`${today()}T00:00:00Z`);
  let years = now.getUTCFullYear() - dob.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - dob.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getUTCDate() < dob.getUTCDate())
  ) {
    years -= 1;
  }
  return years;
}
