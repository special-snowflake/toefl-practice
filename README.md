# TOEFL Practice — Simulasi Latihan Structure & Reading

Aplikasi latihan TOEFL-style untuk pengguna Indonesia. Fokus **Structure & Reading** (tanpa Listening), dengan 10 paket soal orisinal, timer real, dan pembahasan bahasa Indonesia yang jelas.

> **Bukan tes resmi ETS.** Semua skor adalah **Estimasi Latihan (Estimated Practice Score)** — bukan skor resmi TOEFL®.

**🔗 Coba langsung:** Vercel production alias **https://toefl-practice-nine.vercel.app** · Repo: **https://github.com/special-snowflake/toefl-practice** · Materi: [/materi](https://toefl-practice-nine.vercel.app/materi)

> Jika alias belum update ke build terbaru, import repo di https://vercel.com/new (Next.js, `npm run build`, tanpa env) — deploy 1 klik.

---

## Cara Pakai (30 detik)

1. Buka link di atas → klik **Mulai Latihan**
2. Isi **nama** (hanya untuk sapaan di hasil, 2–40 karakter, tidak disimpan)
3. Pilih **Mode**:
   - **🎲 Acak** — paket dipilih random dari 10 variasi (simulasi ujian beneran)
   - **🎯 Pilih Manual** — pilih `Test 01` s/d `Test 10` sendiri (untuk fokus materi tertentu)
4. Baca **Instruksi** → **Mulai** (Structure 25 menit → Reading 55 menit)
5. Kerjakan soal — pindah soal tidak mereset timer, **auto-submit** saat waktu habis
6. Klik **Kumpulkan Jawaban** → lihat **Estimated Score 310–677**, ringkasan benar/salah, dan **Pembahasan lengkap** per soal

**Tips:**
- Butuh teori dulu? Buka **📖 Materi Lengkap** di header/landing — rangkuman semua grammar yang diuji (past/present, negative verbs, inversion, dll.) dengan contoh persis seperti di soal.
- Salah di Structure? Cek Materi #1–#9 sesuai topiknya, lalu coba paket lain dengan Mode Manual.
- Refresh tidak sengaja? Sesi dipulihkan via `sessionStorage` selama tab masih terbuka.

---

## Fitur

- **10 variasi paket** (Test 01–10) — Structure 20 soal + Reading 4 passages ×5 soal = 40 soal/paket, dipilih acak atau manual
- **Materi Lengkap** di `/materi` — tenses, negative verbs, SV agreement, passive, pronouns, articles/prepositions/conjunctions, clauses, parallel/comparatives, modifiers/word forms/inversion, + strategi Reading — bahasa Indonesia santai
- **Timer beneran** — Structure 25:00 → Reading 55:00, hitung per detik, auto-submit, section lock (Structure tidak bisa dibuka lagi setelah lanjut)
- **Navigasi ujian** — Previous/Next, grid nomor soal (sedang/terjawab/belum), progress bar
- **Reading split layout** — passage di kiri (sticky, scrollable) + pertanyaan di kanan, tetap terlihat saat jawab
- **Penilaian stateless** — `POST /api/score` hitung di server dari jawabanmu, bukan dari skor kiriman client; kosong = **dihitung salah** (tanpa nilai minus)
- **Pembahasan Indonesia** — setiap soal: jawabanmu vs. kunci + penjelasan kenapa salah/benar
- **Hover cursor** — semua tombol ada pointer saat hover; setelah submit otomatis scroll ke atas (explanations)
- **Tanpa login / tanpa database / tanpa penyimpanan permanen**

---

## Stateless & Privasi

```
Nama → state sementara (React + sessionStorage)
→ soal dari file di repo → jawaban di memori browser
→ POST /api/score {testId, answers} → server validasi & hitung → kembalikan hasil
→ tutup tab / Tes Lagi → data hilang
```

- Tidak ada PostgreSQL/MySQL/MongoDB/Supabase/Firebase/Redis
- Tidak ada Google Sheets/Airtable — soal adalah file `src/data/tests/test-*.ts` di GitHub
- Tidak ada akun, riwayat, atau dashboard admin berisi data user
- `sessionStorage` hanya untuk resume jika refresh (hilang saat tab ditutup); tidak pakai `localStorage` permanen
- `POST /api/score` tidak menyimpan request — hanya validasi → hitung → response
- Nama tidak dikirim ke API (hanya di frontend untuk sapaan)
- Tidak ada pelacakan personal; tidak sengaja log identitas user

> Vercel mungkin punya log infrastruktur umum, tapi aplikasi tidak menambahkan data identifikasi ke log.

---

## Instalasi

```bash
npm install
npm run dev
# http://localhost:3000
```

## Production Build

```bash
npm run build
npm start
```

## Deploy ke Vercel

1. Push ke GitHub (sudah: `special-snowflake/toefl-practice`)
2. Vercel → **Add New Project** → Import repo
3. Framework **Next.js** (auto), Build `npm run build`, tanpa env vars
4. Deploy — dapat URL `*.vercel.app`

Repo ini sudah live di **https://toefl-practice-nine.vercel.app** (alias). Untuk selalu pakai build terbaru, import manual atau hubungkan git: `vercel git connect` (atau `vercel login` → `vercel --prod`).

---

## Arsitektur

```
toefl-practice/
├── src/app/
│   ├── page.tsx          # landing → name+mode → test → result (client)
│   ├── materi/page.tsx   # /materi — rangkuman semua grammar & strategi reading
│   ├── layout.tsx & globals.css
│   └── api/
│       ├── test/route.ts  # GET /api/test[?id=test-03] → soal TANPA kunci
│       └── score/route.ts # POST /api/score {testId, answers} → skor + pembahasan
├── src/data/tests/
│   ├── test-01.ts ... test-10.ts  # 10 paket orisinal (40 soal each)
│   └── index.ts
├── src/lib/
│   ├── scoring.ts        # Skor: correct/total → 310..677, per-section scaled 31..68
│   ├── validation.ts & security.ts (rate limit in-memory)
│   └── test-selection.ts
└── src/types/test.ts
```

**Kenapa stateless?** Soal statis di repo, jawaban hanya di `useState`/`sessionStorage`, scoring di serverless tanpa simpan data — validasi `testId`/`questionId` dan hitung dari jawaban saja.

---

## Menambah Paket Baru

1. Duplikat `src/data/tests/test-01.ts` → `test-11.ts`, ganti `id: "test-11"` dan isi 20+20 soal dengan `explanation` Indonesia
2. Daftarkan di `src/data/tests/index.ts` (`import { test11 }` → `allTests["test-11"] = test11`)
3. Tambah ke `TEST_IDS` di `src/lib/test-selection.ts` untuk pool acak
4. Tambah `<option>` di mode manual (`src/app/page.tsx`) dan build: `npm run build`

---

## Penilaian (Scoring) — diperjelas

**File:** `src/lib/scoring.ts` — satu tempat, mudah ubah. Label selalu **Estimated Practice Score**.

1. Per section scaled (mirip PBT): `scaled = 31 + round((correct/total)*37)` → 31..68
2. **Total estimasi:** `totalPct = (structure.correct + reading.correct) / 40` → `estimatedScore = round(310 + totalPct * 367)` → **310..677**
3. Kosong = salah (tidak ada minus, tapi tetap salah — tidak seperti dulu yang dipisah)

Contoh: **12/20 Structure (60%) + 0/20 Reading (0%) = 12/40 = 30% → 310+110 ≈ 419–420.** Wajar rendah karena Reading 0 menarik rata-rata turun. Jika dapat 15/20 + 15/20 = 30/40=75% → 585. 40/40 → 677.

Skala per section tetap ditampilkan: `Structure 12/20 (scaled 53/68)` `Reading 0/20 (scaled 31/68)`.

---

## Keamanan

- Nama: trim, 2–40 char, tolak `< > script`
- API: `testId` wajib ada, `questionId` harus milik test itu, jawaban hanya `A|B|C|D`, max 100, tolak malformed JSON
- Rate limit in-memory: `GET /api/test` 60/menit, `POST /api/score` 20/menit per IP (tanpa DB)
- Kunci tidak dikirim di `GET`; hanya `POST` yang mengembalikan kunci+explanation
- Client tidak bisa kirim `{score: 600}` — server selalu hitung ulang
- Tidak ada secrets/keys di frontend

---

## Checklist

- [x] `npm run build` sukses (Next 16) — `/` + `/materi` + 2 API routes
- [x] 10 paket soal orisinal, acak & manual mode
- [x] Materi lengkap `/materi` (10 topik: tenses, negative, SV agreement, passive, pronouns, articles/preps, clauses, parallel/comparatives, modifiers/inversion, reading strategy)
- [x] Timer, auto-submit, section lock, navigator, split Reading
- [x] Scoring 310–677 (kosong = salah), `scaled 31–68`, pembahasan Indonesia `✗ Salah (kosong)`
- [x] Hover cursor, scroll-to-top ke pembahasan
- [x] Validasi & rate limit, tanpa DB/akun/persistent storage

---

## Lisensi

Soal orisinal untuk latihan — bukan soal resmi ETS. TOEFL® milik ETS.
