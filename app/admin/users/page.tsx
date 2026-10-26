import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { UserRow } from "@/components/admin/user-row";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const me = await getCurrentUser();
  const users = await db.user.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
    select: {
      id: true,
      handle: true,
      name: true,
      email: true,
      role: true,
      status: true,
      branch: true,
      year: true,
      createdAt: true,
    },
  });

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Users ({users.length})</h2>
        <p className="text-[11px] text-muted">
          {me?.role === "admin" ? "you can change roles" : "moderators can ban only"}
        </p>
      </div>

      {users.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted">No users yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {users.map((u) => (
            <li key={u.id}>
              <UserRow
                self={u.id === me?.id}
                canChangeRole={me?.role === "admin"}
                user={{
                  id: u.id,
                  handle: u.handle,
                  name: u.name,
                  email: u.email,
                  role: u.role,
                  status: u.status,
                  branch: u.branch,
                  year: u.year,
                  createdAt: u.createdAt.toISOString(),
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
