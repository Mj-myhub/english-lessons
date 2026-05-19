# The English Lounge — project notes

Static marketing + IELTS practice site for The English Lounge (Rome).
Plain HTML/CSS/JS, served by GitHub Pages from the repo root. Owner edits
files on mobile via the GitHub app, so keep files small and root-level.

## Standing instructions

- **Always commit and push changes to GitHub automatically.** After making
  any change the user asked for, commit it and push to the working branch
  without asking for confirmation. If no PR exists for the branch, open a
  draft PR. The user does not want to be asked "should I push?" each time.
- Develop on the branch specified in the task; never push to a different
  branch without explicit permission.
- All IELTS content must be **original** (no Cambridge/British Council
  copyrighted material).

## Structure

- `index.html` — bilingual (EN/IT) home page.
- `ielts.html` — IELTS hub: free taster + mock-test directory + skill index.
- `ielts.css` — shared stylesheet for the hub and all `ielts-test-NN.html`.
- `ielts-test-01.html`, … — one complete mock test per page. Listening
  audio lives in `/audio/test-NN-listening-sN.mp3` (generated via free TTS
  from the in-page transcripts).
- `sitemap.xml` — add every new page here.

## IELTS roadmap

Goal: ~50 full Academic mock tests, added in batches each session at
genuine exam length/quality. Hub shows upcoming tests as "coming soon".
