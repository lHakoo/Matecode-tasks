import type { Task } from '@/types/task';

interface SendSummaryResult {
  ok: boolean;
  message: string;
}

/**
 * Llama a la Vercel Function /api/send-summary, que es la unica que
 * tiene permiso (y credenciales) para hablar con AWS SES.
 * El frontend nunca ve las credenciales de AWS.
 */
export async function sendTaskSummaryEmail(
  toEmail: string,
  tasks: Task[],
): Promise<SendSummaryResult> {
  const response = await fetch('/api/send-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      toEmail,
      summary: {
        total: tasks.length,
        completed: tasks.filter((t) => t.completed).length,
        pending: tasks.filter((t) => !t.completed).length,
        titles: tasks.map((t) => ({ title: t.title, completed: t.completed })),
      },
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    return { ok: false, message: body.error ?? 'No se pudo enviar el email.' };
  }

  return { ok: true, message: 'Email enviado correctamente.' };
}
