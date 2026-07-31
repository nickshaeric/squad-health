import type { Club, Season, User } from "@/domain/types";

export const CLUB: Club = {
  id: "club-drina",
  name: "FK Drina",
  shortName: "Drina",
  city: "Zvornik",
  country: "BA",
  timezone: "Europe/Sarajevo",
};

export const SEASONS: Season[] = [
  {
    id: "season-2425",
    clubId: CLUB.id,
    label: "2024/25",
    startsOn: "2024-07-01",
    endsOn: "2025-06-30",
    isCurrent: false,
  },
  {
    id: "season-2526",
    clubId: CLUB.id,
    label: "2025/26",
    startsOn: "2025-07-01",
    endsOn: "2026-06-30",
    isCurrent: true,
  },
];

export const CURRENT_SEASON = SEASONS[1];

/**
 * Staff. Referenced by episodes, treatments, and rehab approvals so the
 * demo can attribute records to a named person rather than an opaque id.
 */
export const USERS: User[] = [
  {
    id: "user-medical-lead",
    clubId: CLUB.id,
    firstName: "Emina",
    lastName: "Hadžić",
    jobTitle: "Club doctor",
  },
  {
    id: "user-medical-staff",
    clubId: CLUB.id,
    firstName: "Vedran",
    lastName: "Kovačević",
    jobTitle: "Physiotherapist",
  },
  {
    id: "user-head-coach",
    clubId: CLUB.id,
    firstName: "Slaviša",
    lastName: "Milanović",
    jobTitle: "Head coach",
  },
  {
    id: "user-coach",
    clubId: CLUB.id,
    firstName: "Damir",
    lastName: "Perić",
    jobTitle: "Assistant coach",
  },
  {
    id: "user-admin",
    clubId: CLUB.id,
    firstName: "Jasmina",
    lastName: "Alić",
    jobTitle: "Club secretary",
  },
];

export function userName(userId: string): string {
  const user = USERS.find((u) => u.id === userId);
  return user ? `${user.firstName} ${user.lastName}` : "Unknown";
}

/**
 * Fixed "today" for the demo. Seed data is authored relative to this so
 * the screens look identical regardless of when they are opened.
 */
export const DEMO_TODAY = "2026-07-30";
