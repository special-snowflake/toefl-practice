
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TOEFL Practice — Simulasi Latihan TOEFL",
  description: "Latihan TOEFL Structure & Reading — 10 variasi soal, tanpa login, tanpa penyimpanan data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col bg-[#f8f9fb] text-zinc-900 antialiased">{children}</body>
    </html>
  );
}
