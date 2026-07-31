"use client";

import Link from "next/link";
import { AvailabilityBadge } from "@/components/availability-badge";
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
  POSITION_LABELS,
  REGION_LABELS,
  UNAVAILABILITY_REASON_LABELS,
} from "@/domain/labels";
import type { BodyRegion } from "@/domain/types";
import { getPlayers, getSquadAvailability } from "@/repository";
import { useAuthContext } from "@/lib/role-context";

export default function SquadPage() {
  const ctx = useAuthContext();
  const players = getPlayers(ctx);
  const availability = getSquadAvailability(ctx);

  const byPlayer = new Map(availability.map((a) => [a.playerId, a]));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Squad</h1>
        <p className="text-muted-foreground text-sm">
          {players.length} registered players.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>First team</CardTitle>
          <CardDescription>
            Select a player to view their injury history.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14 pl-6">No.</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="pr-6 text-right">
                  Availability
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => {
                const status = byPlayer.get(player.id);

                return (
                  <TableRow key={player.id}>
                    <TableCell className="text-muted-foreground pl-6 tabular-nums">
                      {player.shirtNumber}
                    </TableCell>

                    <TableCell>
                      <Link
                        href={`/squad/${player.id}`}
                        className="font-medium hover:underline"
                      >
                        {player.firstName} {player.lastName}
                      </Link>
                    </TableCell>

                    <TableCell className="text-muted-foreground text-sm">
                      {POSITION_LABELS[player.position]}
                    </TableCell>

                    <TableCell className="text-muted-foreground text-sm tabular-nums">
                      {age(player.dateOfBirth)}
                    </TableCell>

                    <TableCell className="text-muted-foreground text-sm">
                      {status?.reason
                        ? [
                            UNAVAILABILITY_REASON_LABELS[status.reason],
                            status.region
                              ? REGION_LABELS[status.region as BodyRegion]
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")
                        : "—"}
                    </TableCell>

                    <TableCell className="pr-6 text-right">
                      {status ? (
                        <AvailabilityBadge status={status.status} />
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/** Age at the demo's fixed today, not at the real clock. */
function age(dateOfBirth: string): number {
  const dob = new Date(`${dateOfBirth}T00:00:00Z`);
  const now = new Date("2026-07-30T00:00:00Z");
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
