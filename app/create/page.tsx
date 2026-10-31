import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { CreateTabs } from "@/components/create/create-tabs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create" };

const TABS = new Set(["post", "note", "lost"]);

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/create");

  const { tab } = await searchParams;
  const initialTab = (tab && TABS.has(tab) ? tab : "post") as "post" | "note" | "lost";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Contribute"
        title="Create something"
        description="Post an update, share a resource, or help someone find what they lost."
      />
      <CreateTabs viewer={me} initialTab={initialTab} />
    </div>
  );
}
