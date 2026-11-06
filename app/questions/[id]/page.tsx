import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatIST } from "@/lib/time";
import { timeAgo } from "@/lib/format";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/ui/badge";
import { AnswerForm } from "@/components/questions/answer-form";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = await db.question.findUnique({ where: { id }, select: { title: true } }).catch(() => null);
  return { title: question?.title ?? "Question" };
}

export default async function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) redirect(`/login?next=/questions/${id}`);

  const question = await db.question.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, handle: true, avatarUrl: true, branch: true, year: true } },
      answers: {
        orderBy: [{ isAccepted: "desc" }, { createdAt: "asc" }],
        include: {
          author: { select: { id: true, name: true, handle: true, avatarUrl: true, role: true } },
        },
      },
    },
  });

  if (!question) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Link
        href="/questions"
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted transition hover:text-foreground"
      >
        <ArrowLeft size={13} /> All questions
      </Link>

      <article className="vz-panel flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="violet" className="normal-case tracking-normal">{question.category}</Badge>
          {question.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-medium text-muted">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-xl font-bold leading-tight tracking-tight">{question.title}</h1>
        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-muted">{question.body}</p>
        <div className="flex items-center gap-2.5 border-t border-border pt-3">
          <Avatar name={question.author.name} handle={question.author.handle} avatarUrl={question.author.avatarUrl} size="sm" />
          <div className="min-w-0 flex-1 text-[10px] text-muted">
            <p className="font-semibold text-foreground">{question.author.name}</p>
            <p>
              @{question.author.handle}
              {question.author.branch ? ` · ${question.author.branch}` : ""}
              {" · "}
              {timeAgo(question.createdAt)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary">
            <MessageCircle size={12} /> {question.answers.length}
          </span>
        </div>
      </article>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-tight">
          {question.answers.length} {question.answers.length === 1 ? "answer" : "answers"}
        </h2>

        {question.answers.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={22} />}
            title="No answers yet"
            description="Be the first to help out."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {question.answers.map((answer) => (
              <article
                key={answer.id}
                className="vz-panel flex flex-col gap-2 p-4"
              >
                <div className="flex items-center gap-2">
                  <Avatar name={answer.author.name} handle={answer.author.handle} avatarUrl={answer.author.avatarUrl} size="xs" />
                  <div className="min-w-0 flex-1 text-[10px] text-muted">
                    <span className="font-semibold text-foreground">{answer.author.name}</span>
                    {" "}@{answer.author.handle}
                    {answer.author.role !== "student" ? ` · ${answer.author.role}` : ""}
                  </div>
                  <span className="text-[9px] text-muted">{timeAgo(answer.createdAt)}</span>
                  {answer.isAccepted ? (
                    <Badge tone="green" className="normal-case tracking-normal">
                      <CheckCircle2 size={10} /> Accepted
                    </Badge>
                  ) : null}
                </div>
                <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed">{answer.body}</p>
                <p className="text-[9px] text-muted-2">{formatIST(answer.createdAt)}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="vz-panel flex flex-col gap-2 p-4">
        <h2 className="text-sm font-bold tracking-tight">Your answer</h2>
        <AnswerForm questionId={question.id} />
      </section>
    </div>
  );
}
