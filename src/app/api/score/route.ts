
import { NextRequest, NextResponse } from "next/server";
import { getTestById } from "@/data/tests";
import { calculateScore } from "@/lib/scoring";
import { checkRateLimit } from "@/lib/security";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip, 20, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi sebentar." }, { status: 429 });
  }
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON tidak valid" }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  const { testId, answers } = body as { testId?: unknown; answers?: unknown };
  if (typeof testId !== "string" || !testId) return NextResponse.json({ error: "testId wajib diisi" }, { status: 400 });
  const test = getTestById(testId);
  if (!test) return NextResponse.json({ error: "Test tidak ditemukan" }, { status: 400 });
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return NextResponse.json({ error: "answers tidak valid" }, { status: 400 });
  const ans = answers as Record<string, unknown>;
  // validate size
  if (Object.keys(ans).length > 100) return NextResponse.json({ error: "Terlalu banyak jawaban" }, { status: 400 });
  // validate values
  const validKeys = new Set<string>();
  for (const q of test.structure.questions) validKeys.add(q.id);
  for (const p of test.reading.passages) for (const q of p.questions) validKeys.add(q.id);
  const clean: Record<string,string> = {};
  for (const [k,v] of Object.entries(ans)) {
    if (!validKeys.has(k)) return NextResponse.json({ error: `Question ID tidak dikenal: ${k}` }, { status: 400 });
    if (typeof v !== "string" || !["A","B","C","D"].includes(v)) return NextResponse.json({ error: `Jawaban tidak valid untuk ${k}` }, { status: 400 });
    clean[k]=v;
  }
  const result = calculateScore(test, clean);
  return NextResponse.json(result);
}
