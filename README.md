# TOEFL Practice — Simulasi Latihan Structure & Reading

Aplikasi latihan TOEFL-style berbasis web untuk pengguna Indonesia. **Bukan tes resmi ETS.** Skor adalah **estimasi latihan** saja.

Live: deploy ke Vercel langsung dari GitHub (Next.js 16).

## Fitur

- **10 variasi soal** berbeda — dipilih acak setiap klik "Mulai"
- **Structure & Written Expression** — 20 soal, 25 menit (grammar: tenses, agreement, clauses, passive, dll.)
- **Reading Comprehension** — 20 soal, 55 menit, 4 passages akademik (biology, history, psychology, geography, dll.)
- **Timer sungguhan** — hitung mundur per detik, auto-submit saat habis, tidak reset saat pindah soal
- **Navigasi profesional** — Previous/Next, navigator nomor soal, indikator terjawab/belum
- **Split layout Reading** — passage di kiri, soal di kanan (desktop), passage tetap terlihat
- **Penilaian stateless** via `POST /api/score` — server hitung skor dari jawaban, bukan dari skor kiriman client
- **Pembahasan bahasa Indonesia** santai — setiap soal ada penjelasan kenapa benar/salah
- **Tanpa login, tanpa database, tanpa penyimpanan permanen**

## Stateless & Privasi

```
User masukkan nama → state sementara (React + sessionStorage)
→ kerjakan soal → jawaban di memori browser
→ submit → server hitung skor → tampilkan hasil
→ tutup tab / tes lagi → data hilang
```

- Tidak ada PostgreSQL / MySQL / MongoDB / Supabase / Firebase / Redis
- Tidak ada Google Sheets / Airtable
- Tidak ada akun, tidak ada "Riwayat Hasil", tidak ada dashboard admin berisi data user
- `sessionStorage` hanya untuk resume jika refresh tidak sengaja (hilang saat tab ditutup)
- `localStorage` tidak dipakai untuk riwayat permanen
- API `POST /api/score` tidak menyimpan request; hanya validasi → hitung → kembalikan
- Nama tidak dikirim ke API scoring (hanya dipakai di frontend untuk sapaan)
- Tidak ada pelacakan personal, tidak ada log yang sengaja menyimpan identitas user

> Hosting (Vercel) mungkin punya log infrastruktur umum, tapi aplikasi tidak menambahkan data identifikasi user ke log.

## Instalasi

```bash
npm install
npm run dev
# buka http://localhost:3000
```

## Production Build

```bash
npm run build
npm start
```

## Deploy ke Vercel

1. Push repo ini ke GitHub
2. Di Vercel: **Add New Project** → Import GitHub repo
3. Framework: Next.js (auto-detect), build command `npm run build`
4. Tidak ada environment variable yang wajib
5. Deploy — selesai

## Arsitektur

```
toefl-practice/
├── src/app/
│   ├── page.tsx          # Single-page app: landing → name → test → result
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── test/route.ts  # GET /api/test[?id=test-03] → soal tanpa kunci
│       └── score/route.ts # POST /api/score {testId, answers} → skor + pembahasan
├── src/data/tests/
│   ├── test-01.ts ... test-10.ts  # Soal statis di repo
│   └── index.ts
├── src/lib/
│   ├── scoring.ts        # Hitung skor: raw → scaled 31-68 → map 310-677
│   ├── validation.ts
│   ├── security.ts       # Rate limit in-memory
│   └── test-selection.ts
└── src/types/test.ts
```

**Kenapa stateless?** Soal ada sebagai file TypeScript di GitHub. Jawaban hanya di React state + `sessionStorage` sementara. API scoring stateless: validasi `testId` & `questionId`, hitung benar/salah, kembalikan hasil, tidak menyimpan apa pun.

## Menambah Tes Baru

1. Duplikat `src/data/tests/test-01.ts` → `test-11.ts`
2. Ganti `id: "test-11"`, isi 20 Structure + 4 passages ×5 Reading, dengan `explanation` bahasa Indonesia
3. Daftarkan di `src/data/tests/index.ts` → `import { test11 }` dan `allTests["test-11"] = test11`
4. Tambahkan ke `TEST_IDS` di `src/lib/test-selection.ts` jika ingin random pool baru
5. `npm run build` untuk cek

## Penilaian (Scoring)

File: `src/lib/scoring.ts`

1. Hitung benar per section: `structure.correct / 20`, `reading.correct / 20`
2. Scaled per section: `31 + round((correct/total)*37)` → rentang 31–68 (mirip TOEFL PBT)
3. Estimasi total: rata-rata scaled dianggap sebagai section ketiga, dijumlah → dipetakan linear ke **310–677**

```ts
scaled = 31 + Math.round((correct/total)*37)
avg = (scaledStructure + scaledReading)/2
rawTotal = scaledStructure + scaledReading + avg   // 93–204
estimatedScore = 310 + ((rawTotal-93)/(204-93))*367 // 310–677
```

Rumus ada di satu file, mudah diubah. Selalu tampilkan label **"Estimated Practice Score"**.

## Keamanan

- Validasi nama: trim, 2–40 karakter, tolak `< > script`
- API validasi: `testId` harus ada, `questionId` harus milik test itu, jawaban hanya `A|B|C|D`, max 100 keys, tolak JSON malformed
- Rate limit ringan in-memory: `GET /api/test` 60/menit, `POST /api/score` 20/menit per IP (tanpa DB)
- Kunci jawaban tidak dikirim di `GET /api/test` — hanya soal + pilihan; kunci + pembahasan baru kembali lewat `POST /api/score`
- Client tidak bisa kirim `{score: 600}` — server selalu hitung dari jawaban
- Tidak ada secrets / API keys di frontend

## Checklist Pengujian

- [x] `npm run build` sukses
- [x] Random test (10 variasi) & soal tampil
- [x] Pilih jawaban, navigasi, indikator terjawab
- [x] Timer hitung mundur, auto-submit, tidak reset saat pindah soal
- [x] Section lock: Structure → Reading tidak bisa kembali
- [x] Scoring: benar/salah/kosong, scaled, estimasi 310–677
- [x] Review: jawabanmu vs kunci + penjelasan Indonesia
- [x] Validasi nama & sanitasi
- [x] API tolak `testId`/jawaban palsu
- [x] `sessionStorage` resume setelah refresh (opsional)
- [x] Tidak ada database / localStorage permanen / akun

## Lisensi

Soal adalah karya orisinal untuk latihan. Bukan soal resmi ETS. TOEFL® adalah merek ETS.
