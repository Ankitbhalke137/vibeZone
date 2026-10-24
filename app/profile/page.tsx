import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/form";
import { LogoutButton } from "@/components/logout-button";

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

  return (
    <div className="mx-auto max-w-md py-6">
      <h1 className="mb-5 text-2xl font-bold">Profile</h1>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{user.name}</p>
            <p className="truncate text-sm text-muted">@{user.handle}</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-4 text-sm">
          <div>
            <dt className="text-xs text-muted">Role</dt>
            <dd className="font-medium">{roleLabel[user.role] ?? user.role}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Year</dt>
            <dd className="font-medium">{user.year ? `Year ${user.year}` : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Branch</dt>
            <dd className="font-medium">{user.branch ?? "—"}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-muted">Campus email</dt>
            <dd className="truncate font-medium">{user.email}</dd>
          </div>
        </dl>

        <div className="flex gap-2 border-t border-border pt-4">
          <LogoutButton />
        </div>
      </Card>

      <p className="mt-4 text-center text-xs text-muted">
        Editing, avatar upload and points arrive in Week 2 (delivery plan).
      </p>
    </div>
  );
}
