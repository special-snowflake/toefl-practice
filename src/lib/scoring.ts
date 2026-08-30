
import type { TestData, ScoreResponse } from "@/types/test";

// Scaled score per section: maps 0..N correct -> 31..68 (TOEFL PBT-like)
// Then estimated total = (scaledStructure + scaledReading + 31) approximated
// Since we have only 2 sections, we simulate 3-section total: (S1+S2+S3)/3*10 not needed.
// Simpler: total = scaledStructure + scaledReading + 31 (assume 31 for missing listening)
// Range: 217..310? To make it feel like 310-677 we scale differently.
// Real TOEFL PBT: each section 31-68, total = (S1+S2+S3). With 2 sections we do:
// estimatedScore = scaledStructure + scaledReading + 31  -> range 93..167 not realistic
// Instead map to 310-677 range: we compute average scaled then *10/3*a but document.
// Practical: map raw pct to 310-677 linearly for display.
// We'll do: scaled = 31 + Math.round((correct/total)*37)  -> 31..68
// totalEstimate = scaledStructure + scaledReading + 31  -> but show as 310-677 via * (677-310)/(~136) not.
// Simpler final: estimatedScore = Math.round(310 + ((scaledStructure+scaledReading -62)/(68+68-62))*367)
// Let's just make it intuitive: total = scaledStructure + scaledReading + 31 with label 310-677 style but actually max 167? That confuses users.
// Better: directly map total correct pct to 310-677.
export function calculateScore(test: TestData, answers: Record<string,string>): ScoreResponse {
  const allStructureIds = test.structure.questions.map(q=>q.id);
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
  const unanswered = total - Object.keys(answers).filter(k=> answers[k] && ["A","B","C","D"].includes(answers[k])).length;
  // Actually count unanswered correctly: questions without valid answer
  let answeredValid = 0;
  for (const q of test.structure.questions) if (answers[q.id] && ["A","B","C","D"].includes(answers[q.id])) answeredValid++;
  for (const {q} of allReadingQs) if (answers[q.id] && ["A","B","C","D"].includes(answers[q.id])) answeredValid++;
  const unansweredCount = total - answeredValid;
  const incorrect = total - correct - unansweredCount;

  const sScaled = 31 + Math.round((sCorrect / sTotal) * 37);
  const rScaled = 31 + Math.round((rCorrect / rTotal) * 37);
  // Estimated PBT-like with 2 sections: extrapolate third as average, then sum
  const avgScaled = (sScaled + rScaled) / 2;
  const estimatedScore = Math.round(sScaled + rScaled + avgScaled); // range ~93..204 mapped to 310..677
  // Map 93..204 to 310..677 linearly
  const mapped = Math.round(310 + ((estimatedScore - 93) / (204 - 93)) * (677 - 310));

  return {
    testId: test.id,
    totalQuestions: total,
    correct,
    incorrect,
    unanswered: unansweredCount,
    structure: { correct: sCorrect, total: sTotal, scaled: sScaled },
    reading: { correct: rCorrect, total: rTotal, scaled: rScaled },
    estimatedScore: mapped,
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
