"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Role = "customer" | "admin";

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  toggleRole: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("customer");
  const router = useRouter();

  const setRole = useCallback(
    (newRole: Role) => {
      setRoleState(newRole);
      router.push(newRole === "admin" ? "/admin" : "/customer");
    },
    [router]
  );

  const toggleRole = useCallback(() => {
    setRole(role === "customer" ? "admin" : "customer");
  }, [role, setRole]);

  return (
    <RoleContext.Provider value={{ role, setRole, toggleRole }}>
      {children}
    </RoleContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return ctx;
}
