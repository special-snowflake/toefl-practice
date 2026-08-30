
export function sanitizeName(input: string): string {
  const t = input.trim().replace(/\s+/g, " ");
  // remove angle brackets etc, but keep display safe via escaping
  return t.slice(0, 40);
}
export function isValidName(name: string): { valid: boolean; error?: string } {
  const t = name.trim();
  if (!t) return { valid: false, error: "Nama tidak boleh kosong." };
  if (t.length < 2) return { valid: false, error: "Nama minimal 2 karakter." };
  if (t.length > 40) return { valid: false, error: "Nama maksimal 40 karakter." };
  if (/<|>|script|onerror|onload/i.test(t)) return { valid: false, error: "Nama mengandung karakter tidak diperbolehkan." };
  return { valid: true };
}
export function isValidAnswer(v: string): boolean {
  return ["A","B","C","D"].includes(v);
}
