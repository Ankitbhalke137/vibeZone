import Link from "next/link";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  Heart,
  Mail,
  MessageSquare,
  NotebookPen,
  Pencil,
  Settings,
  Sparkles,
  Trophy,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { listPosts } from "@/lib/posts";
import { Feed } from "@/components/feed/feed";
import { ProfileHero } from "@/components/profile/profile-hero";
import { ProfileEditor, SignOutEverywhereButton } from "@/components/profile-editor";
import { LogoutButton } from "@/components/logout-button";
import { SectionHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile" };

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const [postCount, commentCount, points, likesReceived, messages, posts] = await Promise.all([
    db.post.count({ where: { authorId: user.id, deletedAt: null } }).catch(() => 0),
    db.postComment.count({ where: { authorId: user.id, deletedAt: null } }).catch(() => 0),
    db.pointLedger.aggregate({ _sum: { points: true }, where: { userId: user.id } }),
    db.postLike
      .count({ where: { post: { authorId: user.id, deletedAt: null } } })
      .catch(() => 0),
    db.message.count({ where: { senderId: user.id, deletedAt: null } }),
    listPosts({ viewerId: user.id, authorId: user.id, take: 8, limitComments: 2 }),
  ]);

  const joined = user.onboardedAt
    ? new Date(user.onboardedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : null;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <ProfileHero
        name={user.name}
        handle={user.handle}
        avatarUrl={user.avatarUrl}
        role={user.role}
        bio={user.bio}
        branch={user.branch}
        year={user.year}
        joinedLabel={joined ?? undefined}
        eyebrow="Your profile"
        action={
          <div className="flex items-center gap-1.5">
            <a
              href="#account"
              className="inline-flex h-8 items-center gap-1 rounded-lg vz-glow-inner border border-border bg-card px-2.5 text-[10px] font-semibold text-muted shadow-sm transition hover:text-foreground"
            >
              <Pencil size={11} /> Edit
            </a>
            <Link
              href="/settings"
              aria-label="Settings"
              className="grid size-8 place-items-center rounded-lg vz-glow-inner border border-border bg-card text-muted shadow-sm transition hover:text-foreground"
            >
              <Settings size={13} />
            </Link>
          </div>
        }
        stats={[
          { label: "Points", value: (points._sum.points ?? 0).toLocaleString("en-IN"), hint: "All time" },
          { label: "Posts", value: postCount, hint: "On campus feed" },
          { label: "Comments", value: commentCount, hint: "Conversations" },
          { label: "Likes", value: likesReceived, hint: "Received" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-3">
          <motion.div
            initial={cardVariants.hidden}
            animate={cardVariants.visible}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center justify-between gap-2">
              <SectionHeader
                title="Your posts"
                description={`${postCount} post${postCount === 1 ? "" : "s"} shared with campus`}
                icon={<NotebookPen size={14} />}
              />
              <Link
                href="/create"
                className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg bg-primary px-2.5 text-[10px] font-bold text-white transition hover:brightness-110"
              >
                New post <ArrowUpRight size={10} />
              </Link>
            </div>
            <Feed
              initialPosts={posts.posts}
              initialCursor={posts.nextCursor}
              viewer={user}
              authorId={user.id}
              emptyTitle="Your feed is waiting"
              emptyDescription="Share an update, a question or a win. Your posts will collect here."
            />
          </motion.div>
        </div>

        <aside id="account" className="flex min-w-0 flex-col gap-3 scroll-mt-20">
          <motion.div
            initial={cardVariants.hidden}
            animate={cardVariants.visible}
            transition={{ delay: 0.1 }}
            className="vz-glass-card p-4"
          >
            <SectionHeader
              title="Account details"
              description="Only visible to you"
              icon={<Sparkles size={14} />}
            />
            <dl className="mt-3 flex flex-col gap-2 text-[10.5px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-1 text-muted">
                  <Mail size={10} /> Email
                </dt>
                <dd className="truncate font-semibold">{user.email}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-1 text-muted">
                  <CalendarDays size={10} /> Joined
                </dt>
                <dd className="font-semibold">{joined ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-1 text-muted">
                  <Trophy size={10} /> Role
                </dt>
                <dd className="font-semibold capitalize">{user.role}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-1 text-muted">
                  <Heart size={10} /> Messages
                </dt>
                <dd className="font-semibold">{messages.toLocaleString("en-IN")}</dd>
              </div>
            </dl>
          </motion.div>

          <motion.div
            initial={cardVariants.hidden}
            animate={cardVariants.visible}
            transition={{ delay: 0.2 }}
            className="vz-glass-card p-4"
          >
            <SectionHeader title="Edit profile" description="Name, handle, bio and avatar" />
            <div className="mt-3">
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
          </motion.div>

          <motion.div
            initial={cardVariants.hidden}
            animate={cardVariants.visible}
            transition={{ delay: 0.3 }}
            className="vz-glass-card p-4"
          >
            <div className="flex items-center gap-2 text-[10.5px] font-bold">
              <MessageSquare size={12} className="text-primary" /> Sessions
            </div>
            <p className="mt-1.5 text-[10px] leading-relaxed text-muted">
              Sign out of this device, or end every session if you think your account was accessed
              somewhere else.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <LogoutButton />
              <div className="text-center">
                <SignOutEverywhereButton />
              </div>
            </div>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
