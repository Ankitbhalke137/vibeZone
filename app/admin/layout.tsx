import { redirect } from "next/navigation";
import { getCurrentUser, hasRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Server-side staff gate — middleware only proves that a session exists. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/admin");
  if (!hasRole(me, "moderator")) redirect("/home");
  return <>{children}</>;
}
