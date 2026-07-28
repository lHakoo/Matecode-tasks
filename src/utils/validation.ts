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
