import { Ban, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { UserDirectory } from "@/components/admin/user-directory";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users · Admin" };

export default async function AdminUsers() {
  const me = await getCurrentUser();
  const users = await db.user.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 500,
    select: {
      id: true,
      handle: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      status: true,
      branch: true,
      year: true,
      createdAt: true,
    },
  });

  const active = users.filter((user) => user.status === "active").length;
  const staff = users.filter((user) => ["moderator", "admin"].includes(user.role)).length;
  const seniors = users.filter((user) => user.role === "senior").length;
  const banned = users.filter((user) => user.status === "banned").length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="People & access"
        title="Campus members"
        description="Search the directory, assign roles and suspend accounts. Every change is audited."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted">
            <ShieldCheck size={12} className="text-primary" />
            {me?.role === "admin" ? "Admin permissions" : "Moderator view"}
          </span>
        }
      />

      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat icon={Users} label="Active" value={active} tone="bg-primary/10 text-primary" />
        <Stat icon={GraduationCap} label="Seniors" value={seniors} tone="bg-cyan-500/10 text-cyan-700 dark:text-cyan-400" />
        <Stat icon={ShieldCheck} label="Staff" value={staff} tone="bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400" />
        <Stat icon={Ban} label="Suspended" value={banned} tone="bg-danger/10 text-danger" />
      </section>

      <UserDirectory
        users={users.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
        }))}
        selfId={me?.id ?? ""}
        canChangeRole={me?.role === "admin"}
      />

      <p className="text-center text-[10px] text-muted-2">
        Roles: student → senior → moderator → admin. Moderators can suspend and restore accounts;
        only admins can change roles.
      </p>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ size?: number | string }>;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="vz-panel flex items-center gap-2.5 p-3">
      <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${tone}`}>
        <Icon size={16} />
      </span>
      <div>
        <p className="text-lg font-black leading-none">{value}</p>
        <p className="mt-0.5 text-[10px] text-muted">{label}</p>
      </div>
    </div>
  );
}
