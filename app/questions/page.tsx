"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, ChevronRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Textarea } from "@/components/ui/form";
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

export default function PollsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
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
        setQuestions(data.questions);
      }
    } catch (e) {
      console.error("Failed to load questions:", e);
    } finally {
      setLoading(false);
    }
  }

  async function createQuestion(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newQuestion.title,
          body: newQuestion.body,
          category: newQuestion.category,
          tags: newQuestion.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        setOpenDialog(false);
        setNewQuestion({ title: "", body: "", category: "general", tags: "" });
        await loadQuestions();
      }
    } catch (e) {
      console.error("Failed to create question:", e);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title="Campus Q&A"
        description="Ask questions, get answers, and help fellow students"
        icon={<Mail size={14} />}
      />

      <div className="flex items-center justify-between px-6 py-4">
        <Button onClick={() => setOpenDialog(true)} className="bg-primary text-white">
          <Plus size={14} /> Ask Question
        </Button>
      </div>

      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted">
              <Mail size={48} className="mb-3 opacity-50" />
              <p>No questions yet</p>
              <Button onClick={() => setOpenDialog(true)} className="mt-4">
                Ask Question
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {questions.map((q) => (
                <div key={q.id} className="vz-panel p-4 hover:vz-card-hover transition-colors">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Badge tone="primary" className="normal-case tracking-normal text-[9px]">
                        {q.category}
                      </Badge>
                      <span className="text-[9px] text-muted">
                        {q.tags.slice(0, 3).join(", ")}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold">{q.title}</h3>
                    <p className="mt-1 line-clamp-2 text-[10.5px] text-muted">
                      {q.body}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-muted">
                          by @{q.author.handle}
                        </span>
                        <span className="text-[9px] text-muted">
                          {q._count.answers} answers
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            )}
          )}
        </div>

        <Modal open={openDialog} onClose={() => setOpenDialog(false)} title="Ask Question">
          <form onSubmit={createQuestion} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted">Question Title</label>
              <input
                value={newQuestion.title}
                onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                className="h-9 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                placeholder="e.g., How to prepare for DSA interviews?"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted">Question</label>
              <Textarea
                value={newQuestion.body}
                onChange={(e) => setNewQuestion({ ...newQuestion, body: e.target.value })}
                rows={4}
                className="h-32 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                placeholder="Describe your question in detail..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted">Category</label>
              <input
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                className="h-9 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                placeholder="e.g., DSA, Placements, General"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted">Tags (comma-separated)</label>
              <input
                value={newQuestion.tags}
                onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                className="h-9 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                placeholder="e.g., DSA, Java, Interview"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Ask Question</Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}