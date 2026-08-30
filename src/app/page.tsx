"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { PublicTestData, ScoreResponse } from "@/types/test";

// ── helpers ──
function fmt(sec: number) {
  const m = Math.floor(sec/60).toString().padStart(2,"0");
  const s = (sec%60).toString().padStart(2,"0");
  return `${m}:${s}`;
}
function sanitizeName(v: string){
  return v.trim().replace(/\s+/g," ").slice(0,40);
}

type Phase = "landing" | "name" | "instructions" | "test" | "result";
type Section = "structure" | "reading";

// ── Main Component ──
export default function Home(){
  const [phase, setPhase] = useState<Phase>("landing");
  const [name, setName] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [test, setTest] = useState<PublicTestData|null>(null);
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState<Section>("structure");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [secLeft, setSecLeft] = useState(25*60);
  const [result, setResult] = useState<ScoreResponse|null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState<null|"section"|"submit">(null);
  const timerRef = useRef<number|null>(null);

  // flattened lists
  const structureQs = test?.structure.questions ?? [];
  const readingPassages = test?.reading.passages ?? [];
  // Build reading flattened: each question knows its passage index
  const readingFlat: { passageIdx:number; qIdx:number; passageTitle:string; pid:string; q: typeof readingPassages[0]["questions"][0] }[] = [];
  readingPassages.forEach((p,pi)=> p.questions.forEach((q,qi)=> readingFlat.push({passageIdx:pi,qIdx:qi,passageTitle:p.title,pid:p.id,q})));
  const currentList = section==="structure" ? structureQs : readingFlat;
  const totalInSection = currentList.length;
  const currentQ = currentList[qIndex] as unknown;
  const totalQuestions = structureQs.length + readingFlat.length;

  // timer
  const startTimer = useCallback((seconds:number)=>{
    if(timerRef.current) window.clearInterval(timerRef.current);
    setSecLeft(seconds);
    timerRef.current = window.setInterval(()=> setSecLeft(s=>{
      if(s<=1){
        if(timerRef.current) window.clearInterval(timerRef.current);
        return 0;
      }
      return s-1;
    }), 1000);
  },[]);
  useEffect(()=> ()=> { if(timerRef.current) window.clearInterval(timerRef.current); },[]);

  // scroll to top when result is shown (explanations)
  useEffect(()=>{
    if(phase==="result"){
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },[phase]);

  // auto-submit on timeout
  useEffect(()=>{
    if(phase!=="test" || secLeft!==0) return;
    if(section==="structure"){
      // auto move to reading
      setSection("reading");
      setQIndex(0);
      if(test) startTimer(test.reading.timeLimitMinutes*60);
    } else {
      // time up -> submit
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secLeft, phase, section]);

  // sessionStorage restore (optional resume)
  useEffect(()=>{
    try{
      const raw = sessionStorage.getItem("toefl_session");
      if(!raw) return;
      const d = JSON.parse(raw);
      if(d.phase==="test" && d.test && d.name){
        // offer resume - for simplicity auto resume
        setName(d.name);
        setTest(d.test);
        setAnswers(d.answers||{});
        setSection(d.section||"structure");
        setQIndex(d.qIndex||0);
        setPhase("test");
        // remaining time estimate
        const elapsed = Math.floor((Date.now()-d.startedAt)/1000);
        const totalSec = d.section==="structure" ? d.test.structure.timeLimitMinutes*60 : d.test.reading.timeLimitMinutes*60;
        const left = Math.max(0, totalSec - elapsed - (d.elapsedOffset||0));
        startTimer(left || totalSec);
      }
    } catch{}
  },[startTimer]);

  useEffect(()=>{
    if(phase==="test" && test){
      try{
        const existing = sessionStorage.getItem("toefl_session");
        let startedAt = Date.now();
        if(existing){ try{ const j=JSON.parse(existing); if(j.startedAt) startedAt=j.startedAt; }catch{} }
        sessionStorage.setItem("toefl_session", JSON.stringify({phase:"test", test, name, answers, section, qIndex, startedAt, elapsedOffset:0}));
      }catch{}
    }
  },[phase,test,name,answers,section,qIndex]);

  function clearSession(){ try{ sessionStorage.removeItem("toefl_session"); }catch{} }

  async function beginTest(){
    const s = sanitizeName(name);
    if(!s || s.length<2){ setNameErr("Masukkan nama minimal 2 karakter."); return; }
    if(/<|>|script/i.test(s)){ setNameErr("Nama mengandung karakter tidak diperbolehkan."); return; }
    setName(s);
    setLoading(true);
    try{
      const r = await fetch("/api/test");
      const data = await r.json();
      if(!r.ok) throw new Error(data.error||"Gagal memuat soal");
      setTest(data);
      setAnswers({});
      setSection("structure");
      setQIndex(0);
      setPhase("test");
      // delay timer start to next tick to ensure test set
      setTimeout(()=> startTimer(data.structure.timeLimitMinutes*60), 100);
      try{ sessionStorage.setItem("toefl_session", JSON.stringify({phase:"test", test:data, name:s, answers:{}, section:"structure", qIndex:0, startedAt:Date.now()})); }catch{}
    } catch(e:unknown){
      alert(e instanceof Error? e.message : "Gagal memuat soal");
    } finally{ setLoading(false); }
  }

  function selectAnswer(qid:string, val:string){
    setAnswers(a=> ({...a, [qid]:val}));
  }

  function goNext(){
    if(qIndex < totalInSection-1) setQIndex(i=>i+1);
  }
  function goPrev(){
    if(qIndex>0) setQIndex(i=>i-1);
  }

  function handleSectionNext(){
    if(section==="structure"){
      setShowConfirm("section");
    }
  }
  function confirmSection(){
    setShowConfirm(null);
    if(timerRef.current) window.clearInterval(timerRef.current);
    setSection("reading");
    setQIndex(0);
    if(test) startTimer(test.reading.timeLimitMinutes*60);
  }

  async function handleSubmit(){
    if(!test) return;
    if(timerRef.current) window.clearInterval(timerRef.current);
    setSubmitting(true);
    try{
      const r = await fetch("/api/score", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ testId: test.id, answers }),
      });
      const data = await r.json();
      if(!r.ok) throw new Error(data.error||"Gagal menghitung skor");
      setResult(data);
      setPhase("result");
      clearSession();
      // ensure visible top of result / explanations immediately
      setTimeout(()=> window.scrollTo({ top: 0, behavior: "smooth" }), 50);
    } catch(e:unknown){
      alert(e instanceof Error? e.message : "Gagal submit");
      // restart timer for reading if was there
      if(section==="reading" && test) startTimer(secLeft || test.reading.timeLimitMinutes*60);
    } finally{ setSubmitting(false); }
  }

  function resetAll(){
    if(timerRef.current) window.clearInterval(timerRef.current);
    clearSession();
    setTest(null);
    setAnswers({});
    setResult(null);
    setSection("structure");
    setQIndex(0);
    setPhase("landing");
  }

  // ── Render helpers ──
  const answeredCount = Object.keys(answers).length;
  const progressPct = totalQuestions ? Math.round((answeredCount/totalQuestions)*100) : 0;

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white grid place-items-center font-bold text-sm">T</div>
            <span className="font-semibold tracking-tight">TOEFL Practice</span>
            <span className="hidden sm:inline text-xs ml-2 px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Simulasi Latihan</span>
          </div>
          <div className="text-xs text-zinc-500 hidden sm:block">Bukan tes resmi ETS • Tanpa login • Tanpa penyimpanan data</div>
        </div>
      </header>

      {/* Landing */}
      {phase==="landing" && (
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-zinc-900 text-white">10 Variasi Soal • Acak Setiap Mulai</div>
                <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">TOEFL Practice<br/><span className="text-zinc-500">Structure & Reading</span></h1>
                <p className="mt-3 text-zinc-600 leading-relaxed">Latihan TOEFL-style yang menyerupai tes yang umum dipraktikkan di Indonesia. <b>Listening tidak termasuk.</b> Skor yang ditampilkan adalah <b>estimasi latihan</b>, bukan skor resmi ETS.</p>
                <div className="mt-6 grid sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <div className="text-sm font-semibold">Structure</div>
                    <div className="text-xs text-zinc-500 mt-1">20 soal • 25 menit</div>
                    <div className="text-xs text-zinc-500">Grammar & written expression</div>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <div className="text-sm font-semibold">Reading</div>
                    <div className="text-xs text-zinc-500 mt-1">20 soal • 55 menit</div>
                    <div className="text-xs text-zinc-500">4 passages akademik</div>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <div className="text-sm font-semibold">Privasi</div>
                    <div className="text-xs text-zinc-500 mt-1">Tanpa akun</div>
                    <div className="text-xs text-zinc-500">Jawaban hanya di browser</div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={()=> setPhase("name")} className="px-6 py-3 rounded-xl bg-zinc-900 text-white font-medium hover:bg-black transition">Mulai Latihan →</button>
                  <a href="#detail" className="px-6 py-3 rounded-xl bg-white border border-zinc-200 font-medium hover:bg-zinc-50">Pelajari dulu</a>
                </div>
                <p className="mt-3 text-xs text-zinc-500">Nama hanya dipakai selama sesi. Tidak ada database. Tutup tab = data hilang.</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
                <div className="text-sm font-semibold">Apa yang kamu dapatkan</div>
                <ul className="mt-3 space-y-2 text-sm text-zinc-600 list-disc ml-5">
                  <li>10 paket soal berbeda, dipilih acak setiap mulai</li>
                  <li>Timer sungguhan & auto-submit saat waktu habis</li>
                  <li>Navigasi soal seperti tes beneran</li>
                  <li>Skor estimasi + review pembahasan bahasa Indonesia</li>
                </ul>
                <div id="detail" className="mt-5 rounded-xl bg-zinc-50 border border-zinc-200 p-4 text-xs leading-relaxed text-zinc-600">
                  <b>Catatan:</b> Aplikasi ini stateless. Tidak memakai database, Google Sheets, atau akun. Soal ada di repository, jawaban hanya di memori browser, dan penilaian lewat API serverless tanpa menyimpan data.
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Name */}
      {phase==="name" && (
        <main className="flex-1 grid place-items-center px-4 py-12">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-semibold">Siapa namamu?</h2>
            <p className="text-sm text-zinc-500 mt-1">Nama hanya dipakai untuk menampilkan hasil di sesi ini. Tidak disimpan permanen.</p>
            <div className="mt-6">
              <label className="text-sm font-medium">Nama</label>
              <input value={name} onChange={e=> {setName(e.target.value); setNameErr("");}} placeholder="Contoh: Budi" maxLength={40} className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-3 outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900" />
              {nameErr && <div className="text-xs text-red-600 mt-2">{nameErr}</div>}
              <div className="text-xs text-zinc-400 mt-1">{name.length}/40</div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={()=> setPhase("landing")} className="flex-1 py-3 rounded-xl border border-zinc-200 bg-white font-medium">Kembali</button>
              <button onClick={beginTest} disabled={loading} className="flex-1 py-3 rounded-xl bg-zinc-900 text-white font-medium disabled:opacity-50">{loading ? "Memuat..." : "Lanjut"}</button>
            </div>
          </div>
        </main>
      )}

      {/* Instructions is folded into landing -> but also show before test? We auto go to test after name, so add interstitial if needed */}
      {/* Test */}
      {phase==="test" && test && (
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <div className="bg-white border-b border-zinc-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm">Halo, <b>{name}</b></span>
                <span className="text-xs px-2 py-1 rounded-full border bg-zinc-50">{test.id.toUpperCase()}</span>
                <span className={`text-xs px-2 py-1 rounded-full border font-medium ${section==="structure" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>{section==="structure" ? "STRUCTURE" : "READING"} • Soal {qIndex+1}/{totalInSection}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-xl border font-mono text-sm font-semibold ${secLeft<60 ? "bg-red-50 border-red-200 text-red-700" : secLeft<300 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-zinc-900 text-white border-zinc-900"}`}>⏱ {fmt(secLeft)}</div>
                <div className="hidden sm:block text-xs text-zinc-500">{answeredCount}/{totalQuestions} terjawab • {progressPct}%</div>
              </div>
            </div>
            {/* progress */}
            <div className="h-1 bg-zinc-100"><div className="h-full bg-zinc-900 transition-all" style={{width: `${progressPct}%`}} /></div>
          </div>

          {/* Question navigator */}
          <div className="bg-white border-b border-zinc-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
              <div className="flex flex-wrap gap-1.5">
                {currentList.map((it, idx)=>{
                  const qid = (section==="structure" ? (it as typeof structureQs[0]).id : (it as typeof readingFlat[0]).q.id);
                  const answered = !!answers[qid];
                  const active = idx===qIndex;
                  return (
                    <button key={qid} onClick={()=> setQIndex(idx)} className={`w-8 h-8 rounded-lg text-xs font-medium border ${active ? "bg-zinc-900 text-white border-zinc-900" : answered ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}>{idx+1}</button>
                  );
                })}
              </div>
              <div className="mt-2 flex gap-3 text-[11px] text-zinc-500">
                <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-zinc-900 inline-block"/> sedang</span>
                <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200 inline-block"/> terjawab</span>
                <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-white border border-zinc-200 inline-block"/> belum</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
            {section==="structure" ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
                {(()=>{
                  const q = structureQs[qIndex];
                  if(!q) return null;
                  return (
                    <div>
                      <div className="text-xs font-semibold tracking-widest text-zinc-500">STRUCTURE • SOAL {qIndex+1} / {structureQs.length}</div>
                      <div className="mt-2 text-[15px] leading-relaxed">{q.question}</div>
                      <div className="mt-5 space-y-2">
                        {q.choices.map((c, i)=>{
                          const letter = ["A","B","C","D"][i] as string;
                          const sel = answers[q.id]===letter;
                          return (
                            <label key={letter} className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition ${sel ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 hover:bg-zinc-50"}`}>
                              <input type="radio" name={q.id} checked={sel} onChange={()=> selectAnswer(q.id, letter)} className="mt-1" />
                              <span className="text-sm"><b>{letter}.</b> {c}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 lg:sticky lg:top-[112px] h-fit max-h-[70vh] overflow-auto">
                  {(()=>{
                    const cur = readingFlat[qIndex];
                    if(!cur) return null;
                    const p = readingPassages[cur.passageIdx];
                    return (
                      <div>
                        <div className="text-xs font-semibold tracking-widest text-zinc-500">READING • {p.title.toUpperCase()}</div>
                        <div className="mt-3 space-y-3 text-[14px] leading-7 text-zinc-700">
                          {p.paragraphs.map((para, i)=> <p key={i}>{para}</p>)}
                        </div>
                        <div className="mt-4 text-xs text-zinc-500">Passage {cur.passageIdx+1} dari {readingPassages.length} • Soal {cur.qIdx+1} dari {p.questions.length} di passage ini</div>
                      </div>
                    );
                  })()}
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
                  {(()=>{
                    const cur = readingFlat[qIndex];
                    if(!cur) return null;
                    const q = cur.q;
                    return (
                      <div>
                        <div className="text-xs font-semibold tracking-widest text-zinc-500">PERTANYAAN {qIndex+1} / {readingFlat.length}</div>
                        <div className="mt-2 text-[15px] leading-relaxed">{q.question}</div>
                        <div className="mt-5 space-y-2">
                          {q.choices.map((c,i)=>{
                            const letter=["A","B","C","D"][i] as string;
                            const sel=answers[q.id]===letter;
                            return (
                              <label key={letter} className={`flex gap-3 p-3 rounded-xl border cursor-pointer ${sel ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 hover:bg-zinc-50"}`}>
                                <input type="radio" name={q.id} checked={sel} onChange={()=> selectAnswer(q.id, letter)} className="mt-1" />
                                <span className="text-sm"><b>{letter}.</b> {c}</span>
                              </label>
                            );
                          })}
                        </div>
                        <div className="mt-4 text-xs text-zinc-500">Passage: {cur.passageTitle}</div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button onClick={goPrev} disabled={qIndex===0} className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white font-medium disabled:opacity-40">← Sebelumnya</button>
              <div className="flex gap-2">
                {section==="structure" ? (
                  <>
                    {qIndex < totalInSection-1 ? (
                      <button onClick={goNext} className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-medium">Berikutnya →</button>
                    ) : (
                      <button onClick={handleSectionNext} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium">Lanjut ke Reading →</button>
                    )}
                  </>
                ) : (
                  <>
                    {qIndex < totalInSection-1 ? (
                      <button onClick={goNext} className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-medium">Berikutnya →</button>
                    ) : (
                      <button onClick={()=> setShowConfirm("submit")} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium">Kumpulkan Jawaban</button>
                    )}
                  </>
                )}
              </div>
            </div>
            {section==="reading" && (
              <div className="mt-3 text-xs text-zinc-500 text-center">Reading tidak bisa kembali ke Structure setelah lanjut. Pastikan Structure sudah kamu cek sebelum melanjutkan.</div>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {phase==="result" && result && (
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
            <div className="text-xs tracking-widest font-semibold text-zinc-500">HASIL • TOEFL PRACTICE (ESTIMASI)</div>
            <h2 className="mt-2 text-2xl font-bold">Halo, {name}!</h2>
            <p className="text-sm text-zinc-500 mt-1">Ini adalah skor latihan, bukan skor resmi ETS.</p>
            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-zinc-900 text-white p-5 text-center">
                <div className="text-xs tracking-widest opacity-70">ESTIMATED SCORE</div>
                <div className="text-4xl font-bold mt-1">{result.estimatedScore}</div>
                <div className="text-xs opacity-70 mt-1">Rentang 310–677</div>
              </div>
              <div className="rounded-2xl border border-zinc-200 p-5">
                <div className="text-xs font-semibold text-zinc-500">RINGKASAN</div>
                <div className="mt-2 text-sm">Benar: <b className="text-emerald-600">{result.correct}</b> • Salah: <b className="text-red-600">{result.incorrect}</b> • Kosong: <b>{result.unanswered}</b> • Total {result.totalQuestions}</div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-zinc-50 border p-3 text-center"><div className="font-semibold">Structure</div><div className="text-lg font-bold">{result.structure.correct}/{result.structure.total}</div><div className="text-zinc-500">scaled {result.structure.scaled}/68</div></div>
                  <div className="rounded-xl bg-zinc-50 border p-3 text-center"><div className="font-semibold">Reading</div><div className="text-lg font-bold">{result.reading.correct}/{result.reading.total}</div><div className="text-zinc-500">scaled {result.reading.scaled}/68</div></div>
                </div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed">
                <b>Apa arti skor ini?</b><br/>Skor dihitung dari persentase benar → scaled 31–68 per section → dipetakan ke 310–677. Ini untuk latihan saja. Untuk prediksi resmi, tetap ikut tes ETS yang sebenarnya.
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={resetAll} className="px-6 py-3 rounded-xl bg-zinc-900 text-white font-medium">Ambil Tes Lain (Acak)</button>
              <a href="#review" className="px-6 py-3 rounded-xl border border-zinc-200 bg-white font-medium">Lihat Pembahasan ↓</a>
            </div>
          </div>

          <div id="review" className="mt-8">
            <h3 className="text-lg font-semibold">Pembahasan Lengkap</h3>
            <p className="text-sm text-zinc-500">Setiap soal menampilkan jawabanmu, kunci, dan penjelasan bahasa Indonesia yang santai.</p>
            <div className="mt-4 space-y-4">
              {result.details.map((d, idx)=>{
                const n = idx+1;
                return (
                  <div key={d.questionId} className={`rounded-2xl border p-5 ${d.isCorrect ? "bg-white border-zinc-200" : "bg-white border-zinc-200"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-semibold tracking-widest text-zinc-500">SOAL {n} {d.passageTitle ? `• ${d.passageTitle}` : ""}</div>
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${d.isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-700" : d.userAnswer ? "bg-red-50 border-red-200 text-red-700" : "bg-zinc-50 border-zinc-200 text-zinc-600"}`}>{d.isCorrect ? "✓ Benar" : d.userAnswer ? "✗ Kurang tepat" : "○ Tidak dijawab"}</span>
                    </div>
                    <div className="mt-2 text-[15px] leading-relaxed">{d.question}</div>
                    <div className="mt-3 grid sm:grid-cols-2 gap-2">
                      {d.choices.map((c,i)=>{
                        const L=["A","B","C","D"][i];
                        const isCorrect = L===d.correctAnswer;
                        const isUser = L===d.userAnswer;
                        return (
                          <div key={L} className={`p-3 rounded-xl border text-sm ${isCorrect ? "bg-emerald-50 border-emerald-200" : isUser ? "bg-red-50 border-red-200" : "bg-zinc-50 border-zinc-200"}`}>
                            <b>{L}.</b> {c} {isCorrect ? "✓" : ""} {isUser && !isCorrect ? "← jawabanmu" : isUser && isCorrect ? "← jawabanmu ✓" : ""}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 text-sm">
                      <div>Jawabanmu: <b>{d.userAnswer ?? "— (kosong)"}</b> • Kunci: <b className="text-emerald-700">{d.correctAnswer}</b></div>
                      <div className="mt-2 rounded-xl bg-zinc-50 border border-zinc-200 p-3 leading-relaxed">💡 {d.explanation}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-center">
              <button onClick={resetAll} className="px-6 py-3 rounded-xl bg-zinc-900 text-white font-medium">Ambil Tes Lain</button>
            </div>
          </div>
        </main>
      )}

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="font-semibold">{showConfirm==="section" ? "Lanjut ke Reading?" : "Kumpulkan jawaban?"}</h3>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              {showConfirm==="section" ? "Setelah lanjut ke Reading, kamu tidak bisa kembali ke Structure. Pastikan sudah cek semua jawaban Structure." : `Kamu menjawab ${answeredCount} dari ${totalQuestions} soal. Soal kosong akan dihitung salah. Yakin ingin kumpulkan sekarang? Sisa waktu ${fmt(secLeft)}.`}
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={()=> setShowConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-zinc-200 bg-white font-medium">Batal</button>
              {showConfirm==="section" ? (
                <button onClick={confirmSection} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium">Ya, lanjut</button>
              ) : (
                <button onClick={()=> { setShowConfirm(null); handleSubmit(); }} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-medium disabled:opacity-50">{submitting ? "Mengirim..." : "Ya, kumpulkan"}</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-xs leading-relaxed text-zinc-500">
          <b>Privasi:</b> Aplikasi ini tidak menyimpan nama, jawaban, atau skormu di server. Semua ada di browser sesi ini saja. Tutup tab = hilang. Tidak ada database, tidak ada akun, tidak ada riwayat. Skor adalah estimasi latihan, bukan skor resmi ETS. Soal adalah karya orisinal untuk latihan, bukan soal resmi TOEFL®.
        </div>
      </footer>
    </div>
  );
}
