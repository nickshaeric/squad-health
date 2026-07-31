"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  UserCheck,
} from "lucide-react";
import { AvailabilityBadge } from "@/components/availability-badge";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { playerById } from "@/data/players";
import {
  ABSENCE_BAND_LABELS,
  POSITION_LABELS,
  REGION_LABELS,
  REHAB_STAGE_LABELS,
  UNAVAILABILITY_REASON_LABELS,
} from "@/domain/labels";
import { isClinical } from "@/domain/projections";
import {
  getActiveEpisodes,
  getSquadAvailability,
  getViewCapabilities,
  today,
} from "@/repository";
import { useAuthContext } from "@/lib/role-context";
import type { BodyRegion } from "@/domain/types";

export default function TeamHealthPage() {
  const ctx = useAuthContext();
  const caps = getViewCapabilities(ctx);

  const availability = getSquadAvailability(ctx);
  const activeEpisodes = getActiveEpisodes(ctx);
  const now = today();

  const available = availability.filter(
    (a) => a.status === "AVAILABLE",
  );
  const doubtful = availability.filter((a) => a.status === "DOUBTFUL");
  const unavailable = availability.filter(
    (a) => a.status === "UNAVAILABLE",
  );

  const injuryRelated = availability.filter(
    (a) => a.reason === "INJURY",
  );
  const nonInjury = availability.filter(
    (a) => a.reason !== null && a.reason !== "INJURY",
  );

  // Records logged pitchside and never completed. Surfacing the count is
  // the point: an incomplete record is a task, not a failure state.
  const incomplete = activeEpisodes.filter(
    (e) => e.completeness === "QUICK",
  );

  const returningSoon = availability
    .filter(
      (a) =>
        a.expectedReturnMatch !== null &&
        a.expectedReturnMatch >= now &&
        a.status !== "AVAILABLE",
    )
    .sort((a, b) =>
      (a.expectedReturnMatch ?? "").localeCompare(
        b.expectedReturnMatch ?? "",
      ),
    );

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Team health
        </h1>
        <p className="text-muted-foreground text-sm">
          Squad availability as of {formatDate(now)}.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Available"
          value={available.length}
          detail={`of ${availability.length} registered players`}
          icon={UserCheck}
        />
        <StatCard
          label="Doubtful"
          value={doubtful.length}
          detail="Training, not yet cleared for selection"
          icon={CalendarClock}
          tone={doubtful.length > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Unavailable"
          value={unavailable.length}
          detail={`${injuryRelated.length} injury, ${nonInjury.length} other`}
          icon={AlertTriangle}
          tone={unavailable.length > 3 ? "critical" : "default"}
        />
        <StatCard
          label="Incomplete records"
          value={incomplete.length}
          detail="Logged pitchside, awaiting medical review"
          icon={ClipboardList}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Currently unavailable</CardTitle>
            <CardDescription>
              {caps.clinical
                ? "Includes clinical detail. Visible to medical staff only."
                : "Body region and expected return. Diagnoses are not shown for this role."}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Player</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Expected return</TableHead>
                  <TableHead className="pr-6 text-right">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...unavailable, ...doubtful].map((row) => {
                  const player = playerById(row.playerId);
                  if (!player) return null;

                  return (
                    <TableRow key={row.playerId}>
                      <TableCell className="pl-6">
                        <Link
                          href={`/squad/${player.id}`}
                          className="hover:underline"
                        >
                          <span className="font-medium">
                            {player.firstName} {player.lastName}
                          </span>
                        </Link>
                        <span className="text-muted-foreground ml-2 text-xs">
                          {player.position}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="text-sm">
                            {row.reason
                              ? UNAVAILABILITY_REASON_LABELS[row.reason]
                              : "—"}
                          </p>
                          {row.region ? (
                            <p className="text-muted-foreground text-xs">
                              {REGION_LABELS[row.region as BodyRegion]}
                            </p>
                          ) : null}
                          {row.matchesRemaining !== null ? (
                            <p className="text-muted-foreground text-xs">
                              {row.matchesRemaining} matches remaining
                            </p>
                          ) : null}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="text-sm tabular-nums">
                            {row.expectedReturnMatch
                              ? formatDate(row.expectedReturnMatch)
                              : "Not estimated"}
                          </p>
                          {row.rehabStage ? (
                            <p className="text-muted-foreground text-xs">
                              {REHAB_STAGE_LABELS[row.rehabStage]}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>

                      <TableCell className="pr-6 text-right">
                        <AvailabilityBadge status={row.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}

                {unavailable.length + doubtful.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground py-8 text-center text-sm"
                    >
                      Full squad available.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Returning</CardTitle>
            <CardDescription>
              Next expected availability for selection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {returningSoon.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No pending returns.
              </p>
            ) : (
              returningSoon.map((row) => {
                const player = playerById(row.playerId);
                if (!player) return null;
                const days = daysUntil(now, row.expectedReturnMatch!);

                return (
                  <div
                    key={row.playerId}
                    className="flex items-baseline justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/squad/${player.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {player.firstName} {player.lastName}
                      </Link>
                      <p className="text-muted-foreground truncate text-xs">
                        {POSITION_LABELS[player.position]}
                        {row.region
                          ? ` · ${REGION_LABELS[row.region as BodyRegion]}`
                          : ""}
                      </p>
                    </div>
                    <p className="text-muted-foreground shrink-0 text-xs tabular-nums">
                      {days === 0
                        ? "Today"
                        : days === 1
                          ? "Tomorrow"
                          : `${days} days`}
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Active injury records</CardTitle>
            <CardDescription>
              {incomplete.length > 0
                ? `${incomplete.length} of ${activeEpisodes.length} records were logged pitchside and have not been completed.`
                : "All active records are complete."}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Player</TableHead>
                  <TableHead>Location</TableHead>
                  {caps.clinical ? (
                    <TableHead>Diagnosis</TableHead>
                  ) : null}
                  <TableHead>Onset</TableHead>
                  <TableHead>Estimate</TableHead>
                  <TableHead className="pr-6 text-right">
                    Record
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEpisodes
                  .slice()
                  .sort((a, b) =>
                    b.onsetDate.localeCompare(a.onsetDate),
                  )
                  .map((episode) => {
                    const player = playerById(episode.playerId);
                    if (!player) return null;

                    return (
                      <TableRow key={episode.id}>
                        <TableCell className="pl-6">
                          <Link
                            href={`/squad/${player.id}`}
                            className="text-sm font-medium hover:underline"
                          >
                            {player.firstName} {player.lastName}
                          </Link>
                        </TableCell>

                        <TableCell className="text-sm">
                          {REGION_LABELS[episode.region]}
                          {episode.side !== "CENTRAL"
                            ? ` (${episode.side.toLowerCase()})`
                            : ""}
                          {episode.isRecurrence ? (
                            <Badge
                              variant="outline"
                              className="border-severity-severe/30 text-severity-severe ml-2 text-xs"
                            >
                              Recurrence
                            </Badge>
                          ) : null}
                        </TableCell>

                        {caps.clinical ? (
                          <TableCell className="text-muted-foreground max-w-[280px] truncate text-sm">
                            {isClinical(episode)
                              ? (episode.diagnosis ?? "Not recorded")
                              : null}
                          </TableCell>
                        ) : null}

                        <TableCell className="text-sm tabular-nums">
                          {formatDate(episode.onsetDate)}
                        </TableCell>

                        <TableCell className="text-muted-foreground text-sm">
                          {episode.estimatedAbsence
                            ? ABSENCE_BAND_LABELS[
                                episode.estimatedAbsence
                              ]
                            : "—"}
                        </TableCell>

                        <TableCell className="pr-6 text-right">
                          {episode.completeness === "QUICK" ? (
                            <Badge
                              variant="outline"
                              className="border-severity-moderate/30 text-severity-moderate text-xs"
                            >
                              Incomplete
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              Complete
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function daysUntil(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00Z`).getTime();
  const b = new Date(`${to}T00:00:00Z`).getTime();
  return Math.max(0, Math.round((b - a) / 86400000));
}
