"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, ClipboardCheck, Repeat, Target } from "lucide-react";
import { StatCard } from "@/components/stat-card";
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
import { SEASONS } from "@/data/club";
import {
  ACTIVITY_LABELS,
  INJURY_TYPE_LABELS,
  REGION_LABELS,
} from "@/domain/labels";
import {
  getActivityCounts,
  getDataQuality,
  getEstimateAccuracy,
  getMonthlyCounts,
  getRecoveryByRegion,
  getRecurrenceSummary,
  getRegionCounts,
  getTypeCounts,
} from "@/repository/analytics";
import { useAuthContext } from "@/lib/role-context";

export default function TrendsPage() {
  const ctx = useAuthContext();

  const regionCounts = getRegionCounts(ctx);
  const monthly = getMonthlyCounts(ctx);
  const types = getTypeCounts(ctx);
  const activities = getActivityCounts(ctx);
  const recovery = getRecoveryByRegion(ctx);
  const accuracy = getEstimateAccuracy(ctx);
  const recurrence = getRecurrenceSummary(ctx);
  const quality = getDataQuality(ctx);

  const currentSeason = SEASONS.find((s) => s.isCurrent);
  const previousSeason = SEASONS.find((s) => !s.isCurrent);

  const regionData = useMemo(
    () =>
      regionCounts.slice(0, 10).map((r) => ({
        region: REGION_LABELS[r.region],
        current: r.current,
        previous: r.previous,
      })),
    [regionCounts],
  );

  const typeData = useMemo(
    () =>
      types.slice(0, 8).map((t) => ({
        type: INJURY_TYPE_LABELS[t.type],
        count: t.count,
      })),
    [types],
  );

  const recurrenceRate =
    recurrence.totalEpisodes === 0
      ? 0
      : Math.round(
          (recurrence.recurrences / recurrence.totalEpisodes) * 100,
        );

  const completenessRate =
    quality.total === 0
      ? 0
      : Math.round((quality.complete / quality.total) * 100);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Injury trends
        </h1>
        <p className="text-muted-foreground text-sm">
          {recurrence.totalEpisodes} recorded episodes across{" "}
          {previousSeason?.label} and {currentSeason?.label}.
        </p>
      </header>

      {/*
        Counts, not rates. Exposure hours are not captured yet, so an
        injury-per-1000-hours figure would be invented rather than
        measured. The absence of a rate is deliberate and worth saying
        out loud during a demo: it is the difference between a tool a
        physio trusts and one they quietly stop believing.
      */}
      <div className="border-muted-foreground/20 bg-muted/30 rounded-lg border border-dashed px-4 py-3">
        <p className="text-muted-foreground text-xs leading-relaxed">
          All figures are counts of recorded episodes. Incidence rates
          per exposure hour are not shown because training and match
          exposure is not yet captured — a rate without a denominator
          would be a guess presented as a measurement. Averages state
          their sample size.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Episodes this season"
          value={regionCounts.reduce((sum, r) => sum + r.current, 0)}
          detail={`${regionCounts.reduce(
            (sum, r) => sum + r.previous,
            0,
          )} in ${previousSeason?.label}`}
          icon={AlertTriangle}
        />
        <StatCard
          label="Recurrences"
          value={`${recurrenceRate}%`}
          detail={`${recurrence.recurrences} of ${recurrence.totalEpisodes} episodes`}
          icon={Repeat}
          tone={recurrenceRate > 12 ? "warning" : "default"}
        />
        <StatCard
          label="Estimate accuracy"
          value={
            accuracy.meanDriftDays > 0
              ? `+${accuracy.meanDriftDays}d`
              : `${accuracy.meanDriftDays}d`
          }
          detail={`Mean drift over ${accuracy.sampleSize} resolved episodes`}
          icon={Target}
          tone={accuracy.meanDriftDays > 5 ? "warning" : "default"}
        />
        <StatCard
          label="Records complete"
          value={`${completenessRate}%`}
          detail={`${quality.quick} logged pitchside, never completed`}
          icon={ClipboardCheck}
          tone={completenessRate < 85 ? "warning" : "default"}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Episodes by body region</CardTitle>
            <CardDescription>
              {currentSeason?.label} against {previousSeason?.label}.
              Ten most affected regions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={regionData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                      fill: "var(--muted-foreground)",
                    }}
                    stroke="var(--border)"
                  />
                  <YAxis
                    type="category"
                    dataKey="region"
                    width={86}
                    tick={{
                      fontSize: 11,
                      fill: "var(--muted-foreground)",
                    }}
                    stroke="var(--border)"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "0.75rem",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "0.75rem" }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="previous"
                    name={previousSeason?.label ?? "Previous"}
                    fill="var(--muted-foreground)"
                    fillOpacity={0.3}
                    radius={[0, 3, 3, 0]}
                  />
                  <Bar
                    dataKey="current"
                    name={currentSeason?.label ?? "Current"}
                    fill="var(--severity-severe)"
                    radius={[0, 3, 3, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>By injury type</CardTitle>
            <CardDescription>
              Both seasons combined.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={typeData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                      fill: "var(--muted-foreground)",
                    }}
                    stroke="var(--border)"
                  />
                  <YAxis
                    type="category"
                    dataKey="type"
                    width={104}
                    tick={{
                      fontSize: 11,
                      fill: "var(--muted-foreground)",
                    }}
                    stroke="var(--border)"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "0.75rem",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Episodes"
                    fill="var(--severity-severe)"
                    fillOpacity={0.8}
                    radius={[0, 3, 3, 0]}
                  >
                    {typeData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={`var(--chart-${(index % 5) + 1})`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Episodes by month</CardTitle>
            <CardDescription>
              {currentSeason?.label}, split by activity. Match and
              training exposure differ substantially per hour, so a rise
              in one means something different from a rise in the other.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthly}
                  margin={{ top: 8, right: 16, bottom: 4, left: -16 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{
                      fontSize: 11,
                      fill: "var(--muted-foreground)",
                    }}
                    stroke="var(--border)"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                      fill: "var(--muted-foreground)",
                    }}
                    stroke="var(--border)"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "0.75rem",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "0.75rem" }}
                    iconType="circle"
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="All episodes"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="matchCount"
                    name="Match"
                    stroke="var(--severity-severe)"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="trainingCount"
                    name="Training"
                    stroke="var(--chart-3)"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mean days out by region</CardTitle>
            <CardDescription>
              Onset to return to match play, resolved episodes only.
              Sample sizes shown because a mean over three episodes and a
              mean over thirty are different claims.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Region</TableHead>
                  <TableHead className="text-right">Mean days</TableHead>
                  <TableHead className="pr-6 text-right">
                    Episodes
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recovery.slice(0, 8).map((row) => (
                  <TableRow key={row.region}>
                    <TableCell className="pl-6 text-sm">
                      {REGION_LABELS[row.region]}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {row.meanDays}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <span
                        className={
                          row.sampleSize < 5
                            ? "text-severity-moderate text-xs tabular-nums"
                            : "text-muted-foreground text-xs tabular-nums"
                        }
                      >
                        n={row.sampleSize}
                        {row.sampleSize < 5 ? " · low" : ""}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recurrence concentration</CardTitle>
              <CardDescription>
                Where repeat injuries cluster. A recurrence is a new
                episode at a site the same player has already injured.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recurrence.byRegion.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No recurrences recorded.
                </p>
              ) : (
                recurrence.byRegion.map((row) => {
                  const share = Math.round(
                    (row.count / recurrence.recurrences) * 100,
                  );

                  return (
                    <div key={row.region} className="space-y-1.5">
                      <div className="flex items-baseline justify-between text-sm">
                        <span>{REGION_LABELS[row.region]}</span>
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {row.count}
                        </span>
                      </div>
                      <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                        <div
                          className="bg-severity-severe h-full rounded-full"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Absence estimate accuracy</CardTitle>
              <CardDescription>
                Computable only because expected and actual return dates
                are stored separately rather than the estimate being
                overwritten on return.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row
                label="Returned later than estimated"
                value={accuracy.late}
                total={accuracy.sampleSize}
              />
              <Row
                label="Within two days of estimate"
                value={accuracy.withinEstimate}
                total={accuracy.sampleSize}
              />
              <Row
                label="Returned earlier than estimated"
                value={accuracy.early}
                total={accuracy.sampleSize}
              />
              <p className="text-muted-foreground border-t pt-3 text-xs leading-relaxed">
                Mean drift is {accuracy.meanDriftDays > 0 ? "+" : ""}
                {accuracy.meanDriftDays} days across{" "}
                {accuracy.sampleSize} resolved episodes. A club that
                consistently underestimates absence plans its squad
                against dates that will not hold.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Where injuries occur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activities.map((row) => (
                <div
                  key={row.activity}
                  className="flex items-baseline justify-between text-sm"
                >
                  <span>{ACTIVITY_LABELS[row.activity]}</span>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {row.count}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const share = total === 0 ? 0 : Math.round((value / total) * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground text-xs tabular-nums">
          {value} · {share}%
        </span>
      </div>
      <div className="bg-muted h-1.5 overflow-hidden rounded-full">
        <div
          className="bg-chart-1 h-full rounded-full"
          style={{ width: `${share}%` }}
        />
      </div>
    </div>
  );
}
