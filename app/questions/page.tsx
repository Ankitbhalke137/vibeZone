"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Plus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";

type Question = {
  id: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  author: { id: string; name: string; handle: string; avatarUrl: string | null };
  _count: { answers: number };
  createdAt: string;
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    body: "",
    category: "general",
    tags: "",
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    try {
      const res = await fetch("/api/v1/questions", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions ?? []);
      }
    } catch (e) {
      console.error("Failed to load questions:", e);
    } finally {
      setLoading(false);
    }
  }

  async function createQuestion(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!newQuestion.title.trim() || !newQuestion.body.trim()) {
      setFormError("Add a title and your question.");
      return;
    }
    try {
      const res = await fetch("/api/v1/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newQuestion.title.trim(),
          body: newQuestion.body.trim(),
          category: newQuestion.category.trim() || "general",
          tags: newQuestion.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        setOpenDialog(false);
        setNewQuestion({ title: "", body: "", category: "general", tags: "" });
        await loadQuestions();
      } else {
        const data = await res.json().catch(() => null);
        setFormError(data?.error ?? "Could not post your question. Please sign in and try again.");
      }
    } catch (err) {
      console.error("Failed to create question:", err);
      setFormError("Network error. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Community"
        title="Campus Q&A"
        description="Ask questions, get answers, and help fellow students figure things out."
        actions={
          <Button onClick={() => setOpenDialog(true)}>
            <Plus size={14} /> Ask question
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="vz-panel h-28 animate-pulse" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border py-20 text-center text-muted">
          <Sparkles size={40} className="opacity-50" />
          <p className="text-sm">No questions yet. Start the conversation.</p>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus size={14} /> Ask the first question
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {questions.map((q) => (
            <Link
              key={q.id}
              href={`/questions/${q.id}`}
              className="vz-panel flex flex-col gap-2 p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="violet" className="normal-case tracking-normal">{q.category}</Badge>
                {q.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-medium text-muted">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-sm font-bold leading-snug">{q.title}</h3>
              <p className="line-clamp-2 text-[11.5px] leading-relaxed text-muted">{q.body}</p>
              <div className="mt-1 flex items-center justify-between text-[10px] text-muted">
                <span>by @{q.author.handle}</span>
                <span className="inline-flex items-center gap-1 font-medium text-primary">
                  <MessageCircle size={12} /> {q._count.answers} {q._count.answers === 1 ? "answer" : "answers"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal open={openDialog} onClose={() => setOpenDialog(false)} title="Ask the campus">
        <form onSubmit={createQuestion} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Question title</label>
            <Input
              value={newQuestion.title}
              onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
              placeholder="e.g. How do I prepare for DSA interviews?"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Details</label>
            <Textarea
              value={newQuestion.body}
              onChange={(e) => setNewQuestion({ ...newQuestion, body: e.target.value })}
              rows={4}
              placeholder="Give context so seniors can help."
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted">Category</label>
              <Input
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                placeholder="e.g. Placements"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted">Tags (comma-separated)</label>
              <Input
                value={newQuestion.tags}
                onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                placeholder="DSA, Java, Interview"
              />
            </div>
          </div>
          {formError ? <p className="rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">{formError}</p> : null}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button type="submit">Post question</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
