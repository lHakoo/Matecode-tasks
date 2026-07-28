import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Cliente de AWS SES. Las credenciales SOLO existen como variables de entorno
// del lado del servidor (Vercel), nunca llegan al bundle del navegador.
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface SummaryPayload {
  toEmail: string;
  summary: {
    total: number;
    completed: number;
    pending: number;
    titles: { title: string; completed: boolean }[];
  };
}

function buildEmailHtml(summary: SummaryPayload['summary']): string {
  const rows = summary.titles
    .map(
      (t) =>
        `<li>${t.completed ? '✅' : '⏳'} ${escapeHtml(t.title)}</li>`,
    )
    .join('');

  return `
    <div style="font-family: sans-serif; color: #1e293b;">
      <h2>Resumen de tus tareas</h2>
      <p>Total: <strong>${summary.total}</strong> · Completadas: <strong>${summary.completed}</strong> · Pendientes: <strong>${summary.pending}</strong></p>
      <ul>${rows}</ul>
    </div>
  `;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const { toEmail, summary } = req.body as SummaryPayload;

  if (!toEmail || !summary) {
    res.status(400).json({ error: 'Faltan datos en la solicitud' });
    return;
  }

  const senderEmail = process.env.SES_SENDER_EMAIL;
  if (!senderEmail) {
    res.status(500).json({ error: 'El servidor no tiene configurado el email remitente' });
    return;
  }

  try {
    await sesClient.send(
      new SendEmailCommand({
        Source: senderEmail,
        Destination: { ToAddresses: [toEmail] },
        Message: {
          Subject: { Data: 'Resumen de tus tareas - MateCode Tasks' },
          Body: { Html: { Data: buildEmailHtml(summary) } },
        },
      }),
    );
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error enviando email con SES:', err);
    res.status(502).json({ error: 'No se pudo enviar el email. Intentá de nuevo más tarde.' });
  }
}
