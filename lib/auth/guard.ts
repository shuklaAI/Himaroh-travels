import type { AdminRole } from "@prisma/client";
import { getAdminSession, hasRole, type AdminSessionUser } from "@/lib/auth/session";

export class AuthorizationError extends Error {
  constructor(message = "You don't have permission to perform this action.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/** Use inside a "use server" action. Throws AuthorizationError if unauthenticated or wrong role. */
export async function requireAdminAction(allowedRoles: AdminRole[]): Promise<AdminSessionUser> {
  const admin = await getAdminSession();
  if (!admin) throw new AuthorizationError("You must be signed in as an admin.");
  if (!hasRole(admin.role, allowedRoles)) throw new AuthorizationError();
  return admin;
}
