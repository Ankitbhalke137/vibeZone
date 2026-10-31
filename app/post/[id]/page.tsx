import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getPost } from "@/lib/posts";
import { PostCard } from "@/components/feed/post-card";
import { Avatar } from "@/components/avatar";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: "Post", description: `A campus post on VibeZone (${id.slice(0, 8)}).` };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  const { id } = await params;
  if (!me) redirect(`/login?next=/post/${id}`);

  const post = await getPost({ id, viewerId: me.id });
  if (!post) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Link
        href="/home"
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted transition hover:text-foreground"
      >
        <ArrowLeft size={13} /> Back to feed
      </Link>

      <PostCard post={post} viewer={me} />

      <Link
        href={`/u/${post.author.handle}`}
        className="vz-panel vz-card-hover flex items-center gap-3 p-4"
      >
        <Avatar name={post.author.name} handle={post.author.handle} avatarUrl={post.author.avatarUrl} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold">{post.author.name}</p>
          <p className="text-[10px] text-muted">
            @{post.author.handle}
            {post.author.branch ? ` · ${post.author.branch}` : ""}
            {post.author.year ? ` Y${post.author.year}` : ""}
          </p>
        </div>
        <span className="text-[10px] font-semibold text-primary">View profile →</span>
      </Link>
    </div>
  );
}
