"use client";

import { useQuery } from "@tanstack/react-query";

export type UserRole = "admin" | "edit" | "read";

interface AdminMeResponse {
  user?: { id: string; email: string };
  isAdmin: boolean;
  role?: UserRole;
  canEdit?: boolean;
}

async function fetchAdminMe(): Promise<AdminMeResponse> {
  const res = await fetch("/api/admin/me", { credentials: "include" });
  if (!res.ok) return { isAdmin: false, role: "read", canEdit: false };
  return res.json();
}

export function useUserRole() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-me"],
    queryFn: fetchAdminMe,
    staleTime: 60 * 1000,
    refetchOnMount: true,
  });

  return {
    role: (data?.role ?? "read") as UserRole,
    isAdmin: data?.isAdmin ?? false,
    canEdit: data?.canEdit ?? false,
    isLoading,
  };
}
