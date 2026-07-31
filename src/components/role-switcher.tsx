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

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  const user = USERS.find((u) => u.id === userIdFor(role));

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-none">
          {user ? `${user.firstName} ${user.lastName}` : ROLE_LABELS[role]}
        </p>
        <p className="text-muted-foreground text-xs">
          {user?.jobTitle}
        </p>
      </div>

      <Select
        value={role}
        onValueChange={(next) => setRole(next as typeof role)}
      >
        <SelectTrigger className="w-[210px]" aria-label="Viewing as">
          <ShieldCheck className="size-4 shrink-0 opacity-60" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r} value={r}>
              <div className="flex flex-col gap-0.5">
                <span>{ROLE_LABELS[r]}</span>
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

function userIdFor(role: string): string {
  switch (role) {
    case "CLUB_ADMIN":
      return "user-admin";
    case "MEDICAL_LEAD":
      return "user-medical-lead";
    case "MEDICAL_STAFF":
      return "user-medical-staff";
    case "HEAD_COACH":
      return "user-head-coach";
    default:
      return "user-coach";
  }
}
