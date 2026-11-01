import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Heart,
  MessageSquare,
  NotebookPen,
  Pencil,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { listPosts } from "@/lib/posts";
import { Avatar } from "@/components/avatar";
import { DmButton } from "@/components/dm-button";
import { Feed } from "@/components/feed/feed";
import { ProfileHero } from "@/components/profile/profile-hero";
import { SectionHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

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
    ? (user.expertise as unknown[]).filter((tag): tag is string => typeof tag === "string")
    : [];
  const isMe = user.id === me.id;

  const [postCount, noteCount, likesReceived, points, posts, similar] = await Promise.all([
    db.post.count({ where: { authorId: user.id, deletedAt: null } }).catch(() => 0),
    db.note.count({ where: { uploadedBy: user.id, removedAt: null } }).catch(() => 0),
    db.postLike
      .count({ where: { post: { authorId: user.id, deletedAt: null } } })
      .catch(() => 0),
    db.pointLedger.aggregate({ _sum: { points: true }, where: { userId: user.id } }),
    listPosts({ viewerId: me.id, authorId: user.id, take: 8, limitComments: 2 }),
    db.user
      .findMany({
        where: {
          id: { notIn: [me.id, user.id] },
          status: "active",
          ...(user.branch ? { branch: user.branch } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          name: true,
          handle: true,
          avatarUrl: true,
          branch: true,
          year: true,
          role: true,
        },
      })
      .catch(() => []),
  ]);

  const joined = user.createdAt.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

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
        joinedLabel={joined}
        expertise={expertise}
        eyebrow={isMe ? "Your profile" : "Campus profile"}
        action={
          isMe ? (
            <Link
              href="/profile"
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-2.5 text-[10px] font-semibold text-muted shadow-sm transition hover:text-foreground"
            >
              <Pencil size={11} /> Edit profile
            </Link>
          ) : (
            <DmButton userId={user.id} label="Message" />
          )
        }
        stats={[
          { label: "Posts", value: postCount, hint: "Shared" },
          { label: "Notes", value: noteCount, hint: "Resources" },
          { label: "Likes", value: likesReceived, hint: "Received" },
          {
            label: "Points",
            value: (points._sum.points ?? 0).toLocaleString("en-IN"),
            hint: "Campus",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <motion.div
          initial={cardVariants.hidden}
          animate={cardVariants.visible}
          className="flex min-w-0 flex-col gap-3"
        >
          <SectionHeader
            title={isMe ? "Your posts" : `Posts by ${user.name.split(" ")[0]}`}
            description={`${postCount} post${postCount === 1 ? "" : "s"} on the campus feed`}
            icon={<NotebookPen size={14} />}
          />
          <Feed
            initialPosts={posts.posts}
            initialCursor={posts.nextCursor}
            viewer={me}
            authorId={user.id}
            emptyTitle={isMe ? "No posts yet" : "Nothing shared yet"}
            emptyDescription={
              isMe
                ? "Share your first update from the create page."
                : "When they post to campus, their updates will appear here."
            }
          />
        </motion.div>

        <aside className="flex min-w-0 flex-col gap-3">
          <motion.div
            initial={cardVariants.hidden}
            animate={cardVariants.visible}
            transition={{ delay: 0.1 }}
            className="vz-glass-card p-4"
          >
            <SectionHeader
              title="About"
              description="A little context"
              icon={<Sparkles size={14} />}
            />
            <dl className="mt-3 flex flex-col gap-2 text-[10.5px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-1 text-muted">
                  <GraduationCap size={10} /> Branch
                </dt>
                <dd className="font-semibold">{user.branch ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-1 text-muted">
                  <BookOpen size={10} /> Year
                </dt>
                <dd className="font-semibold">{user.year ? `Year ${user.year}` : "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-1 text-muted">
                  <Trophy size={10} /> Role
                </dt>
                <dd className="font-semibold capitalize">{user.role}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-1 text-muted">
                  <ShieldCheck size={10} /> Joined
                </dt>
                <dd className="font-semibold">{joined}</dd>
              </div>
            </dl>

            {expertise.length > 0 ? (
              <div className="mt-3 border-t border-border pt-3">
                <p className="text-[9px] font-bold uppercase tracking-wide text-muted-2">
                  Can help with
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {expertise.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </motion.div>

          {!isMe ? (
            <motion.div
              initial={cardVariants.hidden}
              animate={cardVariants.visible}
              transition={{ delay: 0.2 }}
              className="vz-glass-card vz-soft-gradient p-4"
            >
              <SectionHeader
                title="Say hello"
                description="Direct messages are private"
                icon={<MessageSquare size={14} />}
              />
              <p className="mt-2 text-[10px] leading-relaxed text-muted">
                Message {user.name.split(" ")[0]} about classes, notes, campus life or mentoring. Be
                respectful — DMs are moderated when reported.
              </p>
              <div className="mt-3">
                <DmButton userId={user.id} label={`Message ${user.name.split(" ")[0]}`} />
              </div>
            </motion.div>
          ) : null}

          {similar.length > 0 ? (
            <motion.div
              initial={cardVariants.hidden}
              animate={cardVariants.visible}
              transition={{ delay: 0.3 }}
              className="vz-glass-card p-4"
            >
              <SectionHeader
                title={user.branch ? `More from ${user.branch}` : "More people"}
                icon={<Users size={14} />}
                action={
                  <Link href="/explore" className="text-[9px] font-semibold text-primary hover:underline">
                    Explore
                  </Link>
                }
              />
              <ul className="mt-3 flex flex-col gap-2.5">
                {similar.map((person) => (
                  <li key={person.id}>
                    <Link href={`/u/${person.handle}`} className="group flex items-center gap-2.5">
                      <Avatar
                        name={person.name}
                        handle={person.handle}
                        avatarUrl={person.avatarUrl}
                        size="sm"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[10.5px] font-semibold group-hover:text-primary">
                          {person.name}
                        </span>
                        <span className="block truncate text-[9px] text-muted">
                          @{person.handle}
                          {person.year ? ` · Y${person.year}` : ""}
                        </span>
                      </span>
                      <ArrowRight size={11} className="text-muted-2 group-hover:text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : null}

          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold">
              <Heart size={12} className="text-primary" /> Community first
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-muted">
              VibeZone profiles are for verified campus members. Report anything that feels unsafe.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
