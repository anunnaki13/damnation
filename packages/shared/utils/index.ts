export function formatNoRM(num: number): string {
  return `PB-${num.toString().padStart(6, '0')}`;
}

export function generateNoRawat(tipe: string, date: Date = new Date()): string {
  const prefix = tipe === 'RAWAT_JALAN' ? 'RJ' : tipe === 'IGD' ? 'IG' : 'RI';
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${dateStr}-${rand}`;
}

export function calculateAge(birthDate: string | Date): { years: number; months: number } {
  const birth = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months };
}

export function formatAge(birthDate: string | Date): string {
  const { years, months } = calculateAge(birthDate);
  if (years === 0) return `${months} bulan`;
  if (months === 0) return `${years} tahun`;
  return `${years} tahun ${months} bulan`;
}
