# Verity Spiritual Gifts Assessment

Next.js 15 (App Router, TypeScript). Deploys to Vercel from GitHub with no extra config.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in later; the app runs without it
npm run dev
```

## Deploy

1. Push this folder to a new GitHub repo.
2. In Vercel: Add New Project, import the repo, deploy.
3. Add the environment variables from `.env.example` in Project Settings, then redeploy.

## Where things live

| To change | Edit |
| --- | --- |
| Gift names, the six groups, definitions | `lib/gifts.ts` |
| Intro text and the three FAQ items | `components/Assessment.tsx` |
| Questions (add a 5th per gift to lengthen) | `lib/questions.ts` |
| Ministry areas and which gifts fit them | Notion "Ministry Areas" database (fallback: `lib/ministries.ts`) |
| Scoring, tie-breaks, summary wording | `lib/scoring.ts` |
| Email to the ministry and to the person | `app/api/submit/route.ts` |
| Optional AI-written summary | `app/api/summary/route.ts` |
| Colors and type | `app/globals.css` |

## How scoring works

Each of the 25 gifts has the same number of statements (3), each answered 1 to 5. A gift's score is the sum (3 to 15).
Ties break by how many statements were answered "Consistently like me." The top 3 are "primary," ranks 4 to 6 "supporting."
Each gift belongs to one or more of six groups (Manifestation, Ministry / Office, Motivational / Grace, Support, Worship & Priestly, Sign), and the results show a per-group average.
Ministry fit is a weighted average of the gifts mapped to that area. Only areas that include one of the person's top 6 gifts are shown.
The server recomputes results from the raw answers, so emails always match what the person saw.

## Email (Resend)

Set `RESEND_API_KEY`, `RESEND_FROM` (a verified sender), and `MINISTRY_TO_EMAIL`.
Finishing the assessment sends "Gifts form completed" (or "retaken") to the ministry inbox. Submitting the results form sends the person a copy and, if they asked for follow-up, a "Follow-up requested" notice to the ministry.
Without these variables emails are skipped and nothing breaks; logging to Notion still works.

## Optional AI summary

Scoring never touches an LLM. If you want a warmer written summary, set `NEXT_PUBLIC_AI_SUMMARY=true` and `ANTHROPIC_API_KEY`.
The route sends only gift names, scores, and your own ministry list to Claude Haiku, and the built-in summary shows first and is swapped only if the AI one arrives.

## Before launch

- Have the pastor confirm every entry in `lib/ministries.ts` and set `active: false` on any that do not exist.
- Add `href` links to ministry pages when they are ready.
- Add a privacy line to match how your church handles contact info.
- Consider Vercel's WAF rate limiting; the in-app limiter is only a speed bump.

## Notion

Two databases live under the "Verity Gifts Project" page in Notion:

- **Ministry Areas** feeds the "Where these gifts could serve" cards. Uncheck **Active** to hide an area; edits appear within about a minute.
  Core gifts count 3x and Supporting gifts 1x. If every area is unchecked, the section disappears.
- **Gift Submissions** gets one row per person, created when they finish (name, top gifts, ranking, saved answers). A retake updates the same row. Emailing results adds their email to it. Name (first + last) is the key.

Setup: create an internal integration at notion.so/profile/integrations, open the "Verity Gifts Project" page, use Connections to add the integration,
then put its secret in Vercel as `NOTION_API_KEY`. Without it the site uses `lib/ministries.ts` and skips logging.
`SHOW_MINISTRY_AREAS=false` hides the whole section regardless of Notion (needs a redeploy).

## Editing questions

1. On GitHub, open `lib/questions.ts` and click the pencil.
2. Edit the statement text inside the `BANK` list. Keep each in first person ("I ...").
3. To add questions, add one to every gift. The build fails on purpose if any gift has a different count, so a lopsided edit can never go live.
4. Commit. Vercel redeploys in about a minute. To preview first, commit to a branch and open the preview link Vercel posts.
Changing wording changes what a score means, so do it deliberately and expect earlier results not to be directly comparable.
