"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PainAssessment } from "@/domain/types";

/**
 * Pain and function over the course of an episode.
 *
 * Three series rather than one. Pain at rest usually resolves well
 * before pain under load, and a return-to-play decision taken on rest
 * pain alone is how a player gets re-injured. Plotting them together
 * makes the gap visible.
 *
 * Function is inverted relative to pain — higher is better — so a
 * recovering episode shows two lines falling and one rising.
 */
export function PainChart({
  assessments,
  height = 200,
}: {
  assessments: readonly PainAssessment[];
  height?: number;
}) {
  if (assessments.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No assessments recorded.
      </p>
    );
  }

  const data = assessments.map((a) => ({
    date: a.assessedOn,
    label: shortDate(a.assessedOn),
    rest: a.painAtRest,
    load: a.painOnLoad,
    function: a.functionScore,
  }));

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 4, left: -24 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            stroke="var(--border)"
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            stroke="var(--border)"
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              fontSize: "0.75rem",
            }}
            labelStyle={{ color: "var(--foreground)" }}
          />
          <Line
            type="monotone"
            dataKey="load"
            name="Pain on load"
            stroke="var(--severity-severe)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="rest"
            name="Pain at rest"
            stroke="var(--severity-moderate)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="function"
            name="Function"
            stroke="var(--chart-2)"
            strokeWidth={2}
            strokeDasharray="4 3"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
        <LegendItem
          color="var(--severity-severe)"
          label="Pain on load"
        />
        <LegendItem
          color="var(--severity-moderate)"
          label="Pain at rest"
        />
        <LegendItem
          color="var(--chart-2)"
          label="Function (higher is better)"
          dashed
        />
      </div>
    </div>
  );
}

function LegendItem({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="h-0 w-4 border-t-2"
        style={{
          borderColor: color,
          borderStyle: dashed ? "dashed" : "solid",
        }}
        aria-hidden
      />
      <span className="text-muted-foreground text-xs">{label}</span>
    </span>
  );
}

function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}
