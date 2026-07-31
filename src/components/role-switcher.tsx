"use client";

import { ShieldCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/domain/auth";
import { useRole } from "@/lib/role-context";
import { USERS } from "@/data/club";

const USER_FOR_ROLE: Record<string, string> = {
  CLUB_ADMIN: "user-admin",
  MEDICAL_LEAD: "user-medical-lead",
  MEDICAL_STAFF: "user-medical-staff",
  HEAD_COACH: "user-head-coach",
  COACH: "user-coach",
};

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  const user = USERS.find((u) => u.id === USER_FOR_ROLE[role]);

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm leading-none font-medium">
          {user
            ? `${user.firstName} ${user.lastName}`
            : ROLE_LABELS[role]}
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {user?.jobTitle}
        </p>
      </div>

      <Select
        value={role}
        onValueChange={(next) => setRole(next as typeof role)}
      >
        <SelectTrigger className="w-[220px]" aria-label="Viewing as">
          <ShieldCheck className="size-4 shrink-0 opacity-60" />
          <SelectValue>{ROLE_LABELS[role]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r} value={r}>
              <div className="flex flex-col gap-0.5 py-0.5">
                <span className="font-medium">{ROLE_LABELS[r]}</span>
                <span className="text-muted-foreground max-w-[260px] text-xs leading-snug">
                  {ROLE_DESCRIPTIONS[r]}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
