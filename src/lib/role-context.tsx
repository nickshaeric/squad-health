"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CLUB } from "@/data/club";
import type { AuthContext, Role } from "@/domain/auth";

/**
 * Demo role switching.
 *
 * This is scaffolding, not authorisation. It exists so a viewer can see
 * the same screen through five different sets of permissions in one
 * sitting, which is the fastest way to demonstrate that the
 * clinical/availability separation is real.
 *
 * Production must resolve the role server-side from an authenticated
 * session and enforce it in the data-access layer, with row-level
 * security as the backstop. Nothing here should survive to production.
 */

const USER_FOR_ROLE: Record<Role, string> = {
  CLUB_ADMIN: "user-admin",
  MEDICAL_LEAD: "user-medical-lead",
  MEDICAL_STAFF: "user-medical-staff",
  HEAD_COACH: "user-head-coach",
  COACH: "user-coach",
};

interface RoleContextValue {
  ctx: AuthContext;
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({
  children,
  initialRole = "MEDICAL_LEAD",
}: {
  children: ReactNode;
  initialRole?: Role;
}) {
  const [role, setRole] = useState<Role>(initialRole);

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      setRole,
      ctx: {
        role,
        clubId: CLUB.id,
        userId: USER_FOR_ROLE[role],
      },
    }),
    [role],
  );

  return (
    <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const value = useContext(RoleContext);
  if (!value) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return value;
}

/** The auth context alone, for components that only need to query. */
export function useAuthContext(): AuthContext {
  return useRole().ctx;
}
