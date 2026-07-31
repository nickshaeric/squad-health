import type { BodyRegion, BodySide, BodyView } from "@/domain/types";

/**
 * Body map geometry.
 *
 * Each entry is one clickable target: a region, a side, and the view it
 * appears in. A left thigh in the anterior view and a left thigh in the
 * posterior view are separate shapes, because the same anatomy is seen
 * from two angles.
 *
 * Paths are authored against a 220 x 560 viewBox. Anatomically
 * schematic rather than accurate: the requirement is that a physio can
 * hit the right region with a thumb in under a second, which favours
 * generous touch targets over correct musculature. Segments carry a
 * small gap so boundaries are legible before any severity colour is
 * applied.
 */

export interface RegionShape {
  region: BodyRegion;
  side: BodySide;
  view: BodyView;
  path: string;
  /** Label anchor, for tooltips and hit-test centroids. */
  cx: number;
  cy: number;
}

export const VIEW_BOX = { width: 220, height: 560 } as const;

const ANTERIOR: RegionShape[] = [
  {
    region: "HEAD",
    side: "CENTRAL",
    view: "ANTERIOR",
    path: "M110 10c-15 0-25 12-25 29 0 12 4 22 11 27h28c7-5 11-15 11-27 0-17-10-29-25-29z",
    cx: 110,
    cy: 42,
  },
  {
    region: "NECK",
    side: "CENTRAL",
    view: "ANTERIOR",
    path: "M101 68h18v20h-18z",
    cx: 110,
    cy: 78,
  },
  {
    region: "SHOULDER",
    side: "RIGHT",
    view: "ANTERIOR",
    path: "M82 90c-14 1-24 9-28 22l8 6 22-8 4-18z",
    cx: 74,
    cy: 105,
  },
  {
    region: "SHOULDER",
    side: "LEFT",
    view: "ANTERIOR",
    path: "M138 90c14 1 24 9 28 22l-8 6-22-8-4-18z",
    cx: 146,
    cy: 105,
  },
  {
    region: "CHEST",
    side: "CENTRAL",
    view: "ANTERIOR",
    path: "M84 90h52v58H84z",
    cx: 110,
    cy: 119,
  },
  {
    region: "ARM",
    side: "RIGHT",
    view: "ANTERIOR",
    path: "M54 114c-6 14-9 34-9 52l3 44 16-3-3-44 8-42z",
    cx: 56,
    cy: 186,
  },
  {
    region: "ARM",
    side: "LEFT",
    view: "ANTERIOR",
    path: "M166 114c6 14 9 34 9 52l-3 44-16-3 3-44-8-42z",
    cx: 164,
    cy: 186,
  },
  {
    region: "ABDOMEN",
    side: "CENTRAL",
    view: "ANTERIOR",
    path: "M86 151h48v56H86z",
    cx: 110,
    cy: 179,
  },
  {
    region: "HAND",
    side: "RIGHT",
    view: "ANTERIOR",
    path: "M47 213c-4 11-2 24 4 28 7 3 13-4 12-13l-2-16z",
    cx: 55,
    cy: 231,
  },
  {
    region: "HAND",
    side: "LEFT",
    view: "ANTERIOR",
    path: "M173 213c4 11 2 24-4 28-7 3-13-4-12-13l2-16z",
    cx: 165,
    cy: 231,
  },
  {
    region: "HIP_GROIN",
    side: "RIGHT",
    view: "ANTERIOR",
    path: "M86 210h22v40l-19 2-6-22z",
    cx: 97,
    cy: 229,
  },
  {
    region: "HIP_GROIN",
    side: "LEFT",
    view: "ANTERIOR",
    path: "M134 210h-22v40l19 2 6-22z",
    cx: 123,
    cy: 229,
  },
  {
    region: "THIGH",
    side: "RIGHT",
    view: "ANTERIOR",
    path: "M88 255h21l-2 90H90l-5-60z",
    cx: 98,
    cy: 300,
  },
  {
    region: "THIGH",
    side: "LEFT",
    view: "ANTERIOR",
    path: "M132 255h-21l2 90h17l5-60z",
    cx: 122,
    cy: 300,
  },
  {
    region: "KNEE",
    side: "RIGHT",
    view: "ANTERIOR",
    path: "M89 349h19v28H90z",
    cx: 99,
    cy: 363,
  },
  {
    region: "KNEE",
    side: "LEFT",
    view: "ANTERIOR",
    path: "M131 349h-19v28h18z",
    cx: 121,
    cy: 363,
  },
  {
    region: "LOWER_LEG",
    side: "RIGHT",
    view: "ANTERIOR",
    path: "M91 381h17l-3 84H93z",
    cx: 99,
    cy: 423,
  },
  {
    region: "LOWER_LEG",
    side: "LEFT",
    view: "ANTERIOR",
    path: "M129 381h-17l3 84h14z",
    cx: 121,
    cy: 423,
  },
  {
    region: "ANKLE",
    side: "RIGHT",
    view: "ANTERIOR",
    path: "M93 469h13v18H94z",
    cx: 99,
    cy: 478,
  },
  {
    region: "ANKLE",
    side: "LEFT",
    view: "ANTERIOR",
    path: "M127 469h-13v18h12z",
    cx: 121,
    cy: 478,
  },
  {
    region: "FOOT",
    side: "RIGHT",
    view: "ANTERIOR",
    path: "M94 491h13l1 20H92z",
    cx: 100,
    cy: 501,
  },
  {
    region: "FOOT",
    side: "LEFT",
    view: "ANTERIOR",
    path: "M126 491h-13l-1 20h16z",
    cx: 120,
    cy: 501,
  },
];

/**
 * Posterior view.
 *
 * Left and right are mirrored relative to the anterior view: the
 * player's right limb appears on the viewer's left. This is the
 * convention clinicians expect, and getting it wrong would put a
 * hamstring on the wrong leg.
 */
const POSTERIOR: RegionShape[] = [
  {
    region: "HEAD",
    side: "CENTRAL",
    view: "POSTERIOR",
    path: "M110 10c-15 0-25 12-25 29 0 12 4 22 11 27h28c7-5 11-15 11-27 0-17-10-29-25-29z",
    cx: 110,
    cy: 42,
  },
  {
    region: "NECK",
    side: "CENTRAL",
    view: "POSTERIOR",
    path: "M101 68h18v20h-18z",
    cx: 110,
    cy: 78,
  },
  {
    region: "SHOULDER",
    side: "LEFT",
    view: "POSTERIOR",
    path: "M82 90c-14 1-24 9-28 22l8 6 22-8 4-18z",
    cx: 74,
    cy: 105,
  },
  {
    region: "SHOULDER",
    side: "RIGHT",
    view: "POSTERIOR",
    path: "M138 90c14 1 24 9 28 22l-8 6-22-8-4-18z",
    cx: 146,
    cy: 105,
  },
  {
    region: "UPPER_BACK",
    side: "CENTRAL",
    view: "POSTERIOR",
    path: "M84 90h52v62H84z",
    cx: 110,
    cy: 121,
  },
  {
    region: "ARM",
    side: "LEFT",
    view: "POSTERIOR",
    path: "M54 114c-6 14-9 34-9 52l3 44 16-3-3-44 8-42z",
    cx: 56,
    cy: 186,
  },
  {
    region: "ARM",
    side: "RIGHT",
    view: "POSTERIOR",
    path: "M166 114c6 14 9 34 9 52l-3 44-16-3 3-44-8-42z",
    cx: 164,
    cy: 186,
  },
  {
    region: "LOWER_BACK",
    side: "CENTRAL",
    view: "POSTERIOR",
    path: "M86 155h48v52H86z",
    cx: 110,
    cy: 181,
  },
  {
    region: "HAND",
    side: "LEFT",
    view: "POSTERIOR",
    path: "M47 213c-4 11-2 24 4 28 7 3 13-4 12-13l-2-16z",
    cx: 55,
    cy: 231,
  },
  {
    region: "HAND",
    side: "RIGHT",
    view: "POSTERIOR",
    path: "M173 213c4 11 2 24-4 28-7 3-13-4-12-13l2-16z",
    cx: 165,
    cy: 231,
  },
  {
    region: "HIP_GROIN",
    side: "LEFT",
    view: "POSTERIOR",
    path: "M86 210h22v40l-19 2-6-22z",
    cx: 97,
    cy: 229,
  },
  {
    region: "HIP_GROIN",
    side: "RIGHT",
    view: "POSTERIOR",
    path: "M134 210h-22v40l19 2 6-22z",
    cx: 123,
    cy: 229,
  },
  {
    region: "THIGH",
    side: "LEFT",
    view: "POSTERIOR",
    path: "M88 255h21l-2 90H90l-5-60z",
    cx: 98,
    cy: 300,
  },
  {
    region: "THIGH",
    side: "RIGHT",
    view: "POSTERIOR",
    path: "M132 255h-21l2 90h17l5-60z",
    cx: 122,
    cy: 300,
  },
  {
    region: "KNEE",
    side: "LEFT",
    view: "POSTERIOR",
    path: "M89 349h19v28H90z",
    cx: 99,
    cy: 363,
  },
  {
    region: "KNEE",
    side: "RIGHT",
    view: "POSTERIOR",
    path: "M131 349h-19v28h18z",
    cx: 121,
    cy: 363,
  },
  {
    region: "LOWER_LEG",
    side: "LEFT",
    view: "POSTERIOR",
    path: "M91 381h17l-3 84H93z",
    cx: 99,
    cy: 423,
  },
  {
    region: "LOWER_LEG",
    side: "RIGHT",
    view: "POSTERIOR",
    path: "M129 381h-17l3 84h14z",
    cx: 121,
    cy: 423,
  },
  {
    region: "ANKLE",
    side: "LEFT",
    view: "POSTERIOR",
    path: "M93 469h13v18H94z",
    cx: 99,
    cy: 478,
  },
  {
    region: "ANKLE",
    side: "RIGHT",
    view: "POSTERIOR",
    path: "M127 469h-13v18h12z",
    cx: 121,
    cy: 478,
  },
  {
    region: "FOOT",
    side: "LEFT",
    view: "POSTERIOR",
    path: "M94 491h13l1 20H92z",
    cx: 100,
    cy: 501,
  },
  {
    region: "FOOT",
    side: "RIGHT",
    view: "POSTERIOR",
    path: "M126 491h-13l-1 20h16z",
    cx: 120,
    cy: 501,
  },
];

/**
 * Lateral views are defined as empty for the demo. The enum retains all
 * four so nothing downstream changes when they are added, but exposing
 * views with no targets would be worse than not offering them.
 */
export const REGION_SHAPES: Record<BodyView, RegionShape[]> = {
  ANTERIOR,
  POSTERIOR,
  LEFT: [],
  RIGHT: [],
};

/** Whether a region/side pair is targetable in a given view. */
export function shapeFor(
  view: BodyView,
  region: BodyRegion,
  side: BodySide,
): RegionShape | undefined {
  return REGION_SHAPES[view].find(
    (s) => s.region === region && s.side === side,
  );
}

/**
 * The view in which a region is best displayed, used to jump the map to
 * the relevant angle when an injury is selected from a list.
 *
 * Hamstring and calf injuries are posterior structures, so a THIGH or
 * LOWER_LEG episode opens on the back view even though those regions are
 * targetable from the front. A clinician looking at a hamstring expects
 * to be looking at the back of a leg.
 */
export function preferredView(region: BodyRegion): BodyView {
  const posterior: BodyRegion[] = [
    "UPPER_BACK",
    "LOWER_BACK",
    "THIGH",
    "LOWER_LEG",
  ];
  return posterior.includes(region) ? "POSTERIOR" : "ANTERIOR";
}
