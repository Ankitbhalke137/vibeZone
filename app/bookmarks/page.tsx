import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listPosts } from "@/lib/posts";
import { PageHeader } from "@/components/ui/page-header";
import { Feed } from "@/components/feed/feed";

export const dynamic = "force-dynamic";
export const metadata = { title: "Saved" };

export default async function BookmarksPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/bookmarks");

  const saved = await listPosts({
    viewerId: me.id,
    bookmarkedBy: me.id,
    take: 20,
    limitComments: 2,
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <PageHeader
        eyebrow="Your library"
        title="Saved posts"
        description="Everything you bookmarked, kept in one quiet corner."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted">
            <Bookmark size={12} className="text-primary" /> {saved.posts.length} saved
          </span>
        }
      />
      <Feed
        initialPosts={saved.posts}
        initialCursor={saved.nextCursor}
        viewer={me}
        saved
        emptyTitle="No saved posts yet"
        emptyDescription="Tap the bookmark icon on any post and it will show up here."
      />
    </div>
  );
}
