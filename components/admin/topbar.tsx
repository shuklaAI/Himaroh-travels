const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  OPERATIONS_ADMIN: "Operations Admin",
  CONTENT_MANAGER: "Content Manager",
};

export function AdminTopbar({ name, role }: { name: string; role: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-navy/10 bg-white px-6">
      <div />
      <div className="text-right">
        <p className="text-sm font-medium text-navy">{name}</p>
        <p className="text-xs text-navy/50">{ROLE_LABEL[role] ?? role}</p>
      </div>
    </header>
  );
}
