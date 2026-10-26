"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DmButton({ userId, label = "Message" }: { userId: string; label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="secondary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            const res = await fetch(`/api/dm/${userId}`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Couldn't open the chat.");
            router.push(`/chat/${data.channel.slug}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't open the chat.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <MessageSquare size={15} aria-hidden /> {busy ? "Opening…" : label}
      </Button>
      {error ? <p className="text-[11px] text-danger">{error}</p> : null}
    </div>
  );
}
