
import { NextRequest, NextResponse } from "next/server";
import { getTestById, testIds } from "@/data/tests";
import { getPublicTest } from "@/lib/scoring";
import { checkRateLimit } from "@/lib/security";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip, 60, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const t = getTestById(id);
    if (!t) return NextResponse.json({ error: "Test tidak ditemukan" }, { status: 404 });
    return NextResponse.json(getPublicTest(t));
  }
  // random test
  const randomId = testIds[Math.floor(Math.random()*testIds.length)];
  const t = getTestById(randomId)!;
  return NextResponse.json(getPublicTest(t));
}
