import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsPanel } from "@/components/settings/settings-panel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/settings");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Tune the look, review your account, and manage your session."
      />
      <SettingsPanel user={me} />
    </div>
  );
}
