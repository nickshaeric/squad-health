"use client";

import { useMemo, useState } from "react";
import { REGION_LABELS, VIEW_LABELS } from "@/domain/labels";
import type { BodyRegion, BodySide, BodyView } from "@/domain/types";
import { SEVERITY_VAR, type SeverityLevel } from "@/domain/severity";
import { cn } from "@/lib/utils";
import { REGION_SHAPES, VIEW_BOX, type RegionShape } from "./regions";

/**
 * Four-view SVG body map.
 *
 * SVG rather than a 3D model. A physio needs to hit a region with a
 * thumb on a phone at the side of a pitch; a rotatable mesh is slower to
 * use, heavier to load, worse for accessibility, and harder to map onto
 * a fixed set of canonical regions.
 *
 * `region` + `side` is the canonical record. Click coordinates are
 * captured as a rendering hint only and must never drive analytics
 * grouping, because a hint is not a diagnosis and two clinicians will
 * tap different pixels for the same injury.
 */

/**
 * Views offered in the demo.
 *
 * The BodyView enum retains all four, but the lateral views are not
 * exposed: every region they contain is already targetable from the
 * anterior or posterior view, so they add clicking without adding
 * information. Two views drawn well beats four where half look wrong.
 */
const AVAILABLE_VIEWS: readonly BodyView[] = ["ANTERIOR", "POSTERIOR"];

export interface BodyMarker {
  region: BodyRegion;
  side: BodySide;
  severity: SeverityLevel;
  /** Rendered as a tooltip on hover. */
  label?: string;
  /** Dims the marker, for resolved historical injuries. */
  historical?: boolean;
}

export function BodyMap({
  markers = [],
  view: controlledView,
  onViewChange,
  onSelect,
  selected,
  className,
  interactive = true,
}: {
  markers?: readonly BodyMarker[];
  view?: BodyView;
  onViewChange?: (view: BodyView) => void;
  onSelect?: (region: BodyRegion, side: BodySide) => void;
  selected?: { region: BodyRegion; side: BodySide } | null;
  className?: string;
  interactive?: boolean;
}) {
  const [uncontrolledView, setUncontrolledView] =
    useState<BodyView>("ANTERIOR");
  const [hovered, setHovered] = useState<RegionShape | null>(null);

  const view = controlledView ?? uncontrolledView;

  function changeView(next: BodyView) {
    setUncontrolledView(next);
    onViewChange?.(next);
  }

  const shapes = REGION_SHAPES[view];

  /**
   * Highest severity per region/side in this view. A region with both a
   * resolved grade I and an active grade III renders as grade III: the
   * map answers "how bad is this area now", not "how many things have
   * happened here".
   */
  const severityByTarget = useMemo(() => {
    const map = new Map<string, BodyMarker>();

    for (const marker of markers) {
      const key = `${marker.region}:${marker.side}`;
      const existing = map.get(key);
      if (!existing || rank(marker.severity) > rank(existing.severity)) {
        map.set(key, marker);
      }
    }

    return map;
  }, [markers]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        className="bg-muted/40 inline-flex self-center rounded-lg p-1"
        role="tablist"
        aria-label="Body view"
      >
        {AVAILABLE_VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            onClick={() => changeView(v)}
            className={cn(
              "rounded-md px-4 py-1.5 text-xs font-medium transition-colors",
              view === v
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>

      <div className="relative flex justify-center">
        <svg
          viewBox={`0 0 ${VIEW_BOX.width} ${VIEW_BOX.height}`}
          className="h-auto w-full max-w-[240px]"
          role="img"
          aria-label={`Body map, ${VIEW_LABELS[view].toLowerCase()} view`}
        >
          <defs>
            {/*
              Radial falloff per severity level. The gradient centre sits
              at the region centroid and fades outward, which reads as
              "the problem is here and this is roughly how bad it is"
              without implying a precise anatomical boundary the data
              does not support.
            */}
            {(
              ["MINOR", "MODERATE", "SEVERE", "CRITICAL"] as SeverityLevel[]
            ).map((level) => (
              <radialGradient
                key={level}
                id={`severity-${level.toLowerCase()}`}
                cx="50%"
                cy="50%"
                r="60%"
              >
                <stop
                  offset="0%"
                  stopColor={SEVERITY_VAR[level]}
                  stopOpacity="0.95"
                />
                <stop
                  offset="55%"
                  stopColor={SEVERITY_VAR[level]}
                  stopOpacity="0.55"
                />
                <stop
                  offset="100%"
                  stopColor={SEVERITY_VAR[level]}
                  stopOpacity="0.12"
                />
              </radialGradient>
            ))}
          </defs>

          {shapes.map((shape) => {
            const key = `${shape.region}:${shape.side}`;
            const marker = severityByTarget.get(key);
            const isSelected =
              selected?.region === shape.region &&
              selected?.side === shape.side;
            const isHovered =
              hovered?.region === shape.region &&
              hovered?.side === shape.side;

            const fill = marker
              ? `url(#severity-${marker.severity.toLowerCase()})`
              : "var(--severity-none)";

            return (
              <path
                key={key}
                d={shape.path}
                fill={fill}
                fillOpacity={
                  marker?.historical
                    ? 0.45
                    : marker
                      ? 1
                      : isHovered
                        ? 0.85
                        : 0.6
                }
                stroke={
                  isSelected
                    ? "var(--foreground)"
                    : isHovered
                      ? "var(--muted-foreground)"
                      : "var(--background)"
                }
                strokeWidth={isSelected ? 1.75 : 1}
                className={cn(
                  "transition-all duration-150",
                  interactive && "cursor-pointer",
                )}
                onClick={
                  interactive
                    ? () => onSelect?.(shape.region, shape.side)
                    : undefined
                }
                onMouseEnter={() => setHovered(shape)}
                onMouseLeave={() => setHovered(null)}
                role={interactive ? "button" : undefined}
                aria-label={labelFor(shape)}
              />
            );
          })}
        </svg>

        {hovered ? (
          <div className="bg-popover text-popover-foreground pointer-events-none absolute top-0 right-0 rounded-md border px-2.5 py-1.5 text-xs shadow-md">
            <p className="font-medium">{labelFor(hovered)}</p>
            {(() => {
              const marker = severityByTarget.get(
                `${hovered.region}:${hovered.side}`,
              );
              return marker?.label ? (
                <p className="text-muted-foreground mt-0.5 max-w-[180px] leading-snug">
                  {marker.label}
                </p>
              ) : null;
            })()}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function labelFor(shape: RegionShape): string {
  const region = REGION_LABELS[shape.region];
  return shape.side === "CENTRAL"
    ? region
    : `${shape.side === "LEFT" ? "Left" : "Right"} ${region.toLowerCase()}`;
}

function rank(level: SeverityLevel): number {
  return ["NONE", "MINOR", "MODERATE", "SEVERE", "CRITICAL"].indexOf(
    level,
  );
}
