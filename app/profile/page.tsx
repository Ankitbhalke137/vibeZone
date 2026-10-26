import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/form";
import { Avatar } from "@/components/avatar";
import { LogoutButton } from "@/components/logout-button";
import { ProfileEditor, SignOutEverywhereButton } from "@/components/profile-editor";

export const dynamic = "force-dynamic";

const roleLabel: Record<string, string> = {
  student: "Student",
  senior: "Senior",
  moderator: "Moderator",
  admin: "Admin",
};

export default async function ProfilePage() {
  // middleware.ts already guarantees a session for this route
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const [stats, points] = await Promise.all([
    db.message.count({ where: { senderId: user.id, deletedAt: null } }),
    db.pointLedger.aggregate({ _sum: { points: true }, where: { userId: user.id } }),
  ]);

  return (
    <div className="mx-auto max-w-md py-6">
      <h1 className="mb-5 text-2xl font-bold">Profile</h1>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} handle={user.handle} avatarUrl={user.avatarUrl} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{user.name}</p>
            <p className="truncate text-sm text-muted">@{user.handle}</p>
            <p className="mt-1 inline-flex rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-primary">
              {roleLabel[user.role] ?? user.role}
            </p>
          </div>
        </div>

        {user.bio ? <p className="text-sm leading-relaxed text-muted">{user.bio}</p> : null}

        <dl className="grid grid-cols-3 gap-3 border-t border-border pt-4 text-center text-sm">
          <div>
            <dt className="text-xs text-muted">Points</dt>
            <dd className="font-semibold">{points._sum.points ?? 0}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Messages</dt>
            <dd className="font-semibold">{stats}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Year</dt>
            <dd className="font-semibold">{user.year ? `Y${user.year}` : "—"}</dd>
          </div>
        </dl>

        <dl className="flex flex-col gap-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-xs text-muted">Branch</dt>
            <dd className="truncate font-medium">{user.branch ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-xs text-muted">Campus email</dt>
            <dd className="truncate font-medium">{user.email}</dd>
          </div>
        </dl>

        <div className="border-t border-border pt-4">
          <ProfileEditor
            me={{
              name: user.name,
              handle: user.handle,
              avatarUrl: user.avatarUrl,
              bio: user.bio,
              branch: user.branch,
              year: user.year,
              email: user.email,
              role: user.role,
            }}
          />
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <LogoutButton />
          <div className="text-center">
            <SignOutEverywhereButton />
          </div>
        </div>
      </Card>
    </div>
  );
}
