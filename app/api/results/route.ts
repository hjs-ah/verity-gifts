import { NextResponse } from 'next/server';
import { cleanName, decodeAnswers, nameKey } from '@/lib/identity';
import { findSubmission } from '@/lib/notion';
import { clientKey, rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

/** Returns the saved answers for a returning person so the results screen can be rebuilt. */
export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, 'results'), 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const first = cleanName(body.first);
  const last = cleanName(body.last);
  if (!first || !last) return NextResponse.json({ error: 'Enter your first and last name.' }, { status: 400 });

  const record = await findSubmission(nameKey(first, last));
  const answers = record ? decodeAnswers(record.answers) : null;
  if (!answers) return NextResponse.json({ error: 'We could not find earlier results to show.' }, { status: 404 });
  return NextResponse.json({ answers });
}
