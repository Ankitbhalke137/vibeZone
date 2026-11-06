import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, parseJson } from "@/lib/api";
import { awardPoints } from "@/lib/points";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
  explain?: string;
};

const SubmitBody = z.object({
  quizId: z.string().uuid(),
  answers: z.array(z.number().int().min(0).max(20)).min(1).max(20),
});

function questionsOf(value: unknown): QuizQuestion[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (q): q is QuizQuestion =>
      typeof q === "object" &&
      q !== null &&
      typeof (q as QuizQuestion).q === "string" &&
      Array.isArray((q as QuizQuestion).options) &&
      typeof (q as QuizQuestion).answer === "number",
  );
}

export async function GET() {
  try {
    const me = await requireUser();
    const now = new Date();

    const quiz = await db.quiz.findFirst({
      where: {
        OR: [{ opensAt: null }, { opensAt: { lte: now } }],
        AND: [{ OR: [{ closesAt: null }, { closesAt: { gte: now } }] }],
      },
      orderBy: { weekOf: "desc" },
    });

    if (!quiz) {
      return NextResponse.json({ quiz: null, attempt: null });
    }

    const attempt = await db.quizAttempt.findUnique({
      where: { quizId_userId: { quizId: quiz.id, userId: me.id } },
    });

    const questions = questionsOf(quiz.questions);

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        closesAt: quiz.closesAt,
        // Never leak the answer key before the player submits.
        questions: questions.map((q) => ({ q: q.q, options: q.options })),
      },
      attempt: attempt ? { score: attempt.score, total: questions.length, playedAt: attempt.createdAt } : null,
    });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const me = await requireUser();
    const body = await parseJson(req, SubmitBody);

    const quiz = await db.quiz.findUnique({ where: { id: body.quizId } });
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    }
    if (quiz.closesAt && quiz.closesAt < new Date()) {
      return NextResponse.json({ error: "This quiz has closed." }, { status: 410 });
    }

    const existing = await db.quizAttempt.findUnique({
      where: { quizId_userId: { quizId: quiz.id, userId: me.id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You've already played this week's quiz. Come back Monday!" },
        { status: 409 },
      );
    }

    const questions = questionsOf(quiz.questions);
    if (body.answers.length !== questions.length) {
      return NextResponse.json({ error: "Answer every question before submitting." }, { status: 400 });
    }

    const results = questions.map((q, i) => ({
      chosen: body.answers[i],
      correct: q.answer,
      isCorrect: body.answers[i] === q.answer,
      explain: q.explain ?? null,
    }));
    const score = results.filter((r) => r.isCorrect).length;

    const attempt = await db.quizAttempt.create({
      data: { quizId: quiz.id, userId: me.id, score },
    });

    await awardPoints(me.id, "quiz_complete", {
      refType: "quiz",
      refId: quiz.id,
      points: 25 + score * 2,
    });

    return NextResponse.json({
      attempt: { id: attempt.id, score, total: questions.length },
      results,
    });
  } catch (e) {
    return apiError(e);
  }
}
