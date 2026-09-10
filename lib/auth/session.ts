import { getServerSession } from "next-auth";
import type { AdminRole } from "@prisma/client";
import { authOptions } from "@/lib/auth";

export type AdminSessionUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

/** Returns the signed-in admin, or null. Never redirects — callers decide what to do. */
export async function getAdminSession(): Promise<AdminSessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as AdminSessionUser;
}

export function hasRole(role: AdminRole, allowed: AdminRole[]): boolean {
  return allowed.includes(role);
}
