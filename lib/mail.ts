export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function mailConfig(): { from: string; ministryTo: string } | null {
  const from = process.env.RESEND_FROM;
  const ministryTo = process.env.MINISTRY_TO_EMAIL;
  if (!process.env.RESEND_API_KEY || !from || !ministryTo) return null;
  return { from, ministryTo };
}

/** Sends through Resend. Throws on failure so callers decide how much it matters. */
export async function sendEmail(payload: {
  from: string; to: string; subject: string; html: string; text: string; reply_to?: string;
}) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
