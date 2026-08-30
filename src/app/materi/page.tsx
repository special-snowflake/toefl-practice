
import Link from "next/link";

export const metadata = { title: "Materi TOEFL — Structure & Reading" };

const sections = [
  {
    id: "tenses",
    title: "1. Tenses — Past, Present, Future",
    icon: "⏰",
    intro: "TOEFL paling sering menguji apakah kamu pakai tense yang tepat untuk waktu kejadian.",
    points: [
      ["Simple Present vs. Simple Past", "Present untuk kebiasaan/fakta: 'She studies every day.' Past untuk yang sudah selesai: 'She studied yesterday.' Jebakan: ada keterangan waktu 'yesterday' tapi pakai 'has studied' — salah."],
      ["Present Perfect vs. Past Perfect", "'has/have + V3' untuk yang masih nyambung ke sekarang: 'I have lived here for 5 years.' vs. 'had + V3' untuk yang selesai sebelum kejadian lampau lain: 'By the time he arrived, I had finished.' TOEFL suka 'By the time...' → butuh past perfect."],
      ["Continuous & Perfect Continuous", "'is studying / was studying / has been studying' — lihat durasi. 'For three months before publishing...' → 'had been conducting' (past perfect continuous)."],
      ["Future & Conditional", "Conditional 1: 'If you study, you will pass.' Conditional 2: 'If I were you, I would...' (were untuk semua subjek). Conditional 3: 'If you had studied, you would have passed.' Mix: 'If you had invested a decade ago, pollution would be lower now.'"],
    ],
  },
  {
    id: "negation",
    title: "2. Negative Verbs & Negation",
    icon: "🚫",
    intro: "Kalimat negatif tidak cuma 'not'. TOEFL menguji posisi not, auxiliary, dan double negative.",
    points: [
      ["Auxiliary + not", "'do not / does not / did not + V1', 'has not + V3', 'is not + V-ing'. Salah umum: 'He don't go' → harus 'doesn't'."],
      ["Negative inversion", "'Never have I seen...', 'Not only is he smart but...' — setelah kata negatif di depan, auxiliary balik ke depan subject."],
      ["Double negative salah", "'I don't have no money' → salah (dua negatif = positif). Yang benar: 'I don't have any money' / 'I have no money'."],
      ["Negative adverbs", "'Hardly, Scarcely, Barely, Seldom, Rarely' → butuh inversion: 'Hardly had he finished when...' bukan 'Hardly he had finished...'"],
    ],
  },
  {
    id: "sv-agreement",
    title: "3. Subject-Verb Agreement",
    icon: "🤝",
    intro: "Subjek dan verb harus klop singular/plural. Banyak jebakan karena ada frase di antaranya.",
    points: [
      ["Each / Every / One of", "'Each of the students is...' (Each singular), 'One of the books is...' — jangan terkecoh 'students' yang plural."],
      ["Neither / Either / The number", "'Neither the teacher nor the students are...' (ikut yang terdekat), 'The number is...' vs. 'A number of students are...'"],
      ["Collective & uncountable", "'The data are' vs. 'The information is' — 'data' plural, 'information' uncountable singular."],
    ],
  },
  {
    id: "passive",
    title: "4. Passive Voice",
    icon: "🔄",
    intro: "Pasif: 'be + V3'. Aktif vs. pasif menentukan apakah subjek melakukan atau dikenai aksi.",
    points: [
      ["Form", "'The book was reviewed / has been reviewed / will be reviewed' — selalu be + V3. Salah: 'The book reviewed' (aktif) padahal buku tidak bisa mereview."],
      ["Passive dengan modals", "'should be done', 'must be considered' — jangan 'should do' kalau subjek bukan pelaku."],
      ["Reduced passive", "'The data collected over years...' = 'which was collected...' — sering muncul di TOEFL."],
    ],
  },
  {
    id: "pronouns",
    title: "5. Pronouns & Reference",
    icon: "👤",
    intro: "Pronoun harus jelas rujukannya dan sesuai bentuk (subject/object/possessive).",
    points: [
      ["whose / who / whom / which", "'The artist whose works...' (whose = miliknya), 'whom' untuk objek: 'the man whom I met'."],
      ["Reflexive & indefinite", "'Each student must submit his/her report' — pronoun harus singular kalau antecedent singular."],
      ["Reference in Reading", "Soal 'The word \"it\" refers to...' — cari noun terdekat yang masuk akal, bukan yang paling jauh."],
    ],
  },
  {
    id: "articles-prep",
    title: "6. Articles, Prepositions & Conjunctions",
    icon: "🔗",
    intro: "Kata kecil, dampak besar. Collocation harus hafal.",
    points: [
      ["Articles", "'a/an' untuk umum & konsonan/vokal suara: 'a university' (y-sound), 'an hour' (h diam). 'The' untuk yang spesifik/sudah disebut."],
      ["Prepositions", "'consistent with', 'spend time with', 'in spite of / despite (tanpa of)', 'because of + noun' vs. 'because + clause', 'although + clause' vs. 'despite + noun'."],
      ["Conjunctions & clauses", "'Although/Though/Even though + clause' vs. 'In spite of/Despite + noun/gerund'. 'So...that' butuh klausa, 'too...to' tidak."],
    ],
  },
  {
    id: "clauses",
    title: "7. Clauses & Relative Clauses",
    icon: "🧩",
    intro: "Klausa adalah jantung Structure: independent vs. dependent.",
    points: [
      ["Adjective clause", "'The novel which was published in 1965...' — koma = non-restrictive, tanpa koma = restrictive. Reduced: 'The book published in 1965...'"],
      ["Adverb clause", "'When/While/Because/Although/If' + clause lengkap. TOEFL suka memotong conjunction atau klausa tidak lengkap."],
      ["Noun clause & subjunctive", "'It is essential that he be...' (be bukan is), 'The professor suggested that the paper be reviewed' — mandative subjunctive pakai bare form."],
    ],
  },
  {
    id: "parallel",
    title: "8. Parallel Structure & Comparatives",
    icon: "⚖️",
    intro: "Unsur yang digabung harus sejenis: V-ing dengan V-ing, noun dengan noun.",
    points: [
      ["Parallel", "'She likes reading, writing, and dancing' — jangan 'reading, to write, and dancing'. Setelah 'and/or/but' harus paralel."],
      ["Correlative", "'Both A and B', 'Either A or B', 'Not only A but also B' — A dan B harus paralel. 'Not only is he smart but also diligent' (inversi!)."],
      ["Comparatives", "'The more you practice, the better you become' (the + comparative, the + comparative), 'taller than', 'as ... as', 'too ... to' vs. 'so ... that'."],
    ],
  },
  {
    id: "modifiers",
    title: "9. Modifiers, Word Forms & Inversion",
    icon: "✏️",
    intro: "Modifier harus dekat dengan yang dimodifikasi; word form harus sesuai fungsi.",
    points: [
      ["Dangling modifier", "'Having reached the top, the view was amazing' → salah (view tidak bisa reach). Harus: 'Having reached the top, the hikers saw...'"],
      ["Word forms", "'High (adj) vs. highly (adv) vs. height (n)', 'importance (n) vs. important (adj)' — lihat apakah butuh noun/adj/adv di posisi itu."],
      ["Inversion", "Setelah 'Not only, Hardly, Scarcely, Never, No sooner' → auxiliary di depan: 'Hardly had he finished when...', 'No sooner had she arrived than...'"],
    ],
  },
  {
    id: "reading-strategy",
    title: "10. Reading Strategy (Main idea, Inference, Vocab, Reference)",
    icon: "📚",
    intro: "Reading TOEFL bukan hafalan, tapi cari bukti di teks.",
    points: [
      ["Main idea & purpose", "Jawaban harus mencakup keseluruhan passage, bukan detail satu paragraf. Hindari pilihan terlalu spesifik atau terlalu luas."],
      ["Detail & EXCEPT", "Untuk 'EXCEPT' → cari 3 yang disebut di teks, 1 yang tidak. Garis bawahi keyword di passage."],
      ["Vocabulary in context", "Ganti kata dengan pilihan: mana yang bisa masuk tanpa ubah makna kalimat. Lihat kata sekitar, bukan definisi hafalan."],
      ["Inference & Reference", "Inference = apa yang tersirat tapi didukung teks (bukan tebakan luar). Reference: 'it/they' → cari noun sebelumnya yang singular/plural & masuk akal."],
    ],
  },
];

export default function MateriPage(){
  return (
    <div className="min-h-full flex flex-col bg-[#f8f9fb]">
      <header className="sticky top-0 z-10 bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight"><span className="w-8 h-8 rounded-lg bg-zinc-900 text-white grid place-items-center font-bold text-sm">T</span> TOEFL Practice</Link>
          <Link href="/" className="text-sm px-4 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50">← Kembali ke Tes</Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-zinc-900 text-white">📖 Materi Lengkap • Untuk 10 Variasi Soal</div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">Materi TOEFL Structure & Reading</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">Rangkuman semua materi yang diuji di tes ini — dari <b>past & present tenses</b> sampai <b>negative verbs, clauses, inversion</b>, plus strategi Reading. Dibuat ringkas dengan contoh yang persis seperti di soal, jadi kamu bisa buka halaman ini sambil latihan. Bahasa santai, seperti guru nerangin di kelas.</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {sections.map(s=> <a key={s.id} href={`#${s.id}`} className="px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-white">{s.icon} {s.title.split(" —")[0]}</a>)}
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          {sections.map(s=> (
            <section key={s.id} id={s.id} className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 scroll-mt-20">
              <h2 className="text-lg font-bold">{s.icon} {s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{s.intro}</p>
              <ul className="mt-4 space-y-3">
                {s.points.map(([t, desc], i)=> (
                  <li key={i} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="text-sm font-semibold">{t}</div>
                    <div className="mt-1 text-sm leading-relaxed text-zinc-600">{desc}</div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="font-semibold">Cara pakai materi ini pas latihan</h3>
          <ol className="mt-2 text-sm leading-relaxed text-zinc-700 list-decimal ml-5 space-y-1">
            <li>Kerjakan dulu 1 paket tes (<b>Mode Acak</b> untuk simulasi real).</li>
            <li>Lihat pembahasan — kalau salah di Structure, klik materi yang sesuai di halaman ini (mis. “Tenses” atau “Inversion”).</li>
            <li>Ulangi dengan <b>Mode Pilih Manual</b> untuk fokus ke paket lain sampai semua tipe soal kebagian.</li>
            <li>Reading: latih cari bukti di teks dulu, bukan nebak. Materi #10 ada trik EXCEPT & vocab in context.</li>
          </ol>
          <div className="mt-4 flex gap-3">
            <Link href="/" className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium">Mulai Tes Sekarang →</Link>
            <a href="#tenses" className="px-5 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm font-medium">Ke Materi Atas ↑</a>
          </div>
        </div>
      </main>
      <footer className="border-t border-zinc-200 bg-white mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-xs leading-relaxed text-zinc-500">Materi ini orisinal untuk latihan. Bukan materi resmi ETS. Skor tetap estimasi latihan. Kembali ke <Link href="/" className="underline">beranda tes</Link> kapan saja.</div>
      </footer>
    </div>
  );
}
