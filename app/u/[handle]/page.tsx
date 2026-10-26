import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Avatar } from "@/components/avatar";
import { DmButton } from "@/components/dm-button";
import { Card } from "@/components/ui/form";

export const dynamic = "force-dynamic";

const roleLabel: Record<string, string> = {
  student: "Student",
  senior: "Senior",
  moderator: "Moderator",
  admin: "Admin",
};

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return { title: `@${handle}` };
}

export default async function UserProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const me = await getCurrentUser();
  const { handle } = await params;
  if (!me) redirect(`/login?next=/u/${handle}`);

  const user = await db.user.findUnique({
    where: { handle: handle.toLowerCase() },
    select: {
      id: true,
      handle: true,
      name: true,
      avatarUrl: true,
      bio: true,
      branch: true,
      year: true,
      role: true,
      expertise: true,
      createdAt: true,
    },
  });
  if (!user) notFound();

  const expertise = Array.isArray(user.expertise)
    ? (user.expertise as unknown[]).filter((t): t is string => typeof t === "string")
    : [];

  return (
    <div className="mx-auto max-w-md py-6">
      <Link
        href="/chat"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground"
      >
        <ArrowLeft size={13} aria-hidden /> Back
      </Link>
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

        {expertise.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {expertise.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <dl className="flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-xs text-muted">Branch</dt>
            <dd>{user.branch ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-xs text-muted">Year</dt>
            <dd>{user.year ? `Y${user.year}` : "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-xs text-muted">Joined</dt>
            <dd>{user.createdAt.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</dd>
          </div>
        </dl>

        {user.id !== me.id ? <DmButton userId={user.id} /> : null}
      </Card>
    </div>
  );
}
