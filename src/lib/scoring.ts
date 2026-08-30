
import type { TestData, ScoreResponse } from "@/types/test";

// TOEFL PBT-like practice scoring
// Per section: scaled = 31 + round(pct * 37)  -> 31..68
// Total estimate: historically TOEFL PBT total = sum of 3 sections (310..677).
// With only 2 sections (Structure + Reading), we map total correct percentage
// directly to 310..677 for transparency: totalPct = correct/total -> 310 + pct*367.
// This matches the previous "avg-scaled" method but is easier to audit.
// Example: 12/20 Structure (60%) + 0/20 Reading (0%) => total 12/40 = 30% => 310+0.3*367 ≈ 420.
// So 419 for that case is correct: you got 30% overall, with empty answers counted as wrong.
export function calculateScore(test: TestData, answers: Record<string,string>): ScoreResponse {
  const allReadingQs: { id:string; passageTitle:string; q: typeof test.reading.passages[0]["questions"][0] }[] = [];
  for (const p of test.reading.passages) for (const q of p.questions) allReadingQs.push({id:q.id, passageTitle:p.title, q});

  let sCorrect=0, rCorrect=0;
  const details: ScoreResponse["details"] = [];

  for (const q of test.structure.questions) {
    const ua = answers[q.id] ?? null;
    const isCorrect = ua === q.correctAnswer;
    if (isCorrect) sCorrect++;
    details.push({
      questionId: q.id,
      question: q.question,
      choices: q.choices,
      userAnswer: ua,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    });
  }
  for (const {q, passageTitle} of allReadingQs) {
    const ua = answers[q.id] ?? null;
    const isCorrect = ua === q.correctAnswer;
    if (isCorrect) rCorrect++;
    details.push({
      questionId: q.id,
      question: q.question,
      choices: q.choices,
      userAnswer: ua,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
      passageTitle,
    });
  }

  const sTotal = test.structure.questions.length;
  const rTotal = allReadingQs.length;
  const total = sTotal + rTotal;
  const correct = sCorrect + rCorrect;
  let answeredValid = 0;
  for (const q of test.structure.questions) if (answers[q.id] && ["A","B","C","D"].includes(answers[q.id])) answeredValid++;
  for (const {q} of allReadingQs) if (answers[q.id] && ["A","B","C","D"].includes(answers[q.id])) answeredValid++;
  const unansweredCount = total - answeredValid;
  const incorrect = total - correct; // empty = salah, tidak ada pengurangan nilai minus

  const sScaled = 31 + Math.round((sCorrect / sTotal) * 37);
  const rScaled = 31 + Math.round((rCorrect / rTotal) * 37);
  const totalPct = correct / total;
  const estimatedScore = Math.round(310 + totalPct * 367); // 310..677

  return {
    testId: test.id,
    totalQuestions: total,
    correct,
    incorrect,
    unanswered: unansweredCount,
    structure: { correct: sCorrect, total: sTotal, scaled: sScaled },
    reading: { correct: rCorrect, total: rTotal, scaled: rScaled },
    estimatedScore,
    details,
  };
}

export function getPublicTest(test: TestData) {
  return {
    id: test.id,
    title: test.title,
    structure: {
      timeLimitMinutes: test.structure.timeLimitMinutes,
      questions: test.structure.questions.map(({correctAnswer, explanation, ...rest})=> rest),
    },
    reading: {
      timeLimitMinutes: test.reading.timeLimitMinutes,
      passages: test.reading.passages.map(p=> ({
        ...p,
        questions: p.questions.map(({correctAnswer, explanation, ...rest})=> rest),
      })),
    },
  };
}
