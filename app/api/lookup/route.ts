import { NextResponse } from 'next/server';
import { cleanName, decodeAnswers, nameKey } from '@/lib/identity';
import { findSubmission } from '@/lib/notion';
import { clientKey, rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

/** Has this name completed the assessment before? Reveals only whether, when, and how often. No contact info, no answers. */
export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, 'lookup'), 30, 60 * 60 * 1000)) {
    return NextResponse.json({ found: false }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const first = cleanName(body.first);
  const last = cleanName(body.last);
  if (!first || !last) return NextResponse.json({ error: 'Enter your first and last name.' }, { status: 400 });

  const record = await findSubmission(nameKey(first, last));
  if (!record) return NextResponse.json({ found: false });
  return NextResponse.json({
    found: true,
    completedAt: record.completedAt,
    attempts: record.attempts,
    canView: decodeAnswers(record.answers) !== null,
  });
}
