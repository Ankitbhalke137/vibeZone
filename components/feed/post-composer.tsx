"use client";

import { useRef, useState } from "react";
import { Globe2, ImagePlus, Loader2, Send, Sparkles, Users, X } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Viewer = {
  name: string;
  handle: string;
  avatarUrl: string | null;
} | null;

const MAX = 1200;

export function PostComposer({
  viewer,
  onCreated,
  autoFocus,
  className,
  placeholder = "What's happening on campus?",
}: {
  viewer: Viewer;
  onCreated?: () => void | Promise<void>;
  autoFocus?: boolean;
  className?: string;
  placeholder?: string;
}) {
  const { toast } = useToast();
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<"campus" | "public">("campus");
  const [showImage, setShowImage] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [busy, setBusy] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || busy) return;
    setBusy(true);
    try {
      const parsedTags = tags
        .split(/[\s,]+/)
        .map((t) => t.replace(/^#/, "").trim())
        .filter(Boolean)
        .slice(0, 5);

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          body: body.trim(),
          imageUrl: imageUrl.trim() || undefined,
          visibility,
          tags: parsedTags.length ? parsedTags : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't publish your post.");

      setBody("");
      setImageUrl("");
      setTags("");
      setShowImage(false);
      setShowTags(false);
      toast({ title: "Posted to campus", tone: "success" });
      await onCreated?.();
    } catch (err) {
      toast({
        title: "Couldn't publish",
        description: err instanceof Error ? err.message : undefined,
        tone: "error",
      });
    } finally {
      setBusy(false);
      textareaRef.current?.focus();
    }
  }

  return (
    <form onSubmit={submit} className={cn("vz-panel p-4", className)}>
      <div className="flex items-start gap-3">
        <Avatar name={viewer?.name ?? "Guest"} handle={viewer?.handle} avatarUrl={viewer?.avatarUrl} size="md" />
        <div className="min-w-0 flex-1">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX))}
            autoFocus={autoFocus}
            rows={body.length > 120 ? 5 : 3}
            placeholder={placeholder}
            className="w-full resize-none rounded-xl border border-transparent bg-transparent px-1 py-1.5 text-[13.5px] leading-relaxed outline-none transition placeholder:text-muted-2 focus:border-border focus:bg-card focus:px-3"
          />

          {showImage ? (
            <div className="mt-2 flex items-center gap-2">
              <div className="relative flex-1">
                <ImagePlus
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-2"
                />
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.example.com/photo.jpg"
                  className="h-9 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-[11px] outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImage(false);
                  setImageUrl("");
                }}
                aria-label="Remove image"
                className="grid size-9 shrink-0 place-items-center rounded-xl border border-border text-muted transition hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>
          ) : null}

          {showTags ? (
            <div className="mt-2 flex items-center gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-2">
                  #
                </span>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="campuslife, dsa, placements (max 5)"
                  className="h-9 w-full rounded-xl border border-border bg-card pl-6 pr-3 text-[11px] outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowTags(false);
                  setTags("");
                }}
                aria-label="Remove tags"
                className="grid size-9 shrink-0 place-items-center rounded-xl border border-border text-muted transition hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-[var(--vz-border-soft)] pt-2.5">
            <ToolButton
              active={showImage}
              onClick={() => setShowImage((v) => !v)}
              label="Add image"
            >
              <ImagePlus size={14} /> Photo
            </ToolButton>
            <ToolButton active={showTags} onClick={() => setShowTags((v) => !v)} label="Add tags">
              <Sparkles size={14} /> Tags
            </ToolButton>

            <label className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1.5 text-[10px] font-semibold text-muted">
              {visibility === "public" ? <Globe2 size={12} /> : <Users size={12} />}
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as "campus" | "public")}
                aria-label="Post visibility"
                className="cursor-pointer bg-transparent text-[10px] font-semibold text-foreground outline-none"
              >
                <option value="campus">Campus</option>
                <option value="public">Public</option>
              </select>
            </label>

            <span
              className={cn(
                "text-[10px] tabular-nums",
                body.length > MAX - 80 ? "text-warning" : "text-muted-2",
              )}
            >
              {body.length}/{MAX}
            </span>

            <button
              type="submit"
              disabled={busy || !body.trim()}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-[0_8px_20px_-12px_rgba(112,71,245,0.9)] transition hover:brightness-110 disabled:opacity-40"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
              {busy ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function ToolButton({
  children,
  onClick,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition",
        active ? "bg-primary/10 text-primary" : "text-muted hover:bg-accent hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
