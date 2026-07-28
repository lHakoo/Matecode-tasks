export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function isValidTaskTitle(title: string): boolean {
  return title.trim().length > 0 && title.trim().length <= 120;
}

export function formatDate(timestampMs: number): string {
  return new Date(timestampMs).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function isOverdue(dueDateMs: number | null, completed: boolean): boolean {
  if (dueDateMs === null || completed) return false;
  return dueDateMs < Date.now();
}

/** Convierte un valor de <input type="date"> (YYYY-MM-DD, hora local) a timestamp en ms. */
export function dateInputToTimestamp(value: string): number | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).getTime();
}

/** Convierte un timestamp en ms al formato YYYY-MM-DD que espera <input type="date">. */
export function timestampToDateInput(timestampMs: number | null): string {
  if (timestampMs === null) return '';
  const d = new Date(timestampMs);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
