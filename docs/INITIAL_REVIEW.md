# Initial quality review

The idea is a useful, manageable beginner course: five small investigations teach transferable SELECT/FROM/LIMIT skills, with a story to connect them. Keep the first release focused on this loop before adding later chapters, accounts, BI integrations or an AI tutor. The historical setting must remain distinct from the invented teaching records.

## Repaired defects

- The committed `.sqlite` asset contained base64 text; browsers could not query it. It is now a real database, generated from the committed CSV and checked for integrity and parity. Missing database scripts are supplied.
- TypeScript compilation failed because Vite asset/environment declarations were absent and optional hints were dereferenced. The lesson shape is now explicit and builds pass without weakening strict checking.
- SQL ran synchronously on the UI thread, despite the documented worker and timeout. It now runs in a worker, terminates after five seconds, and recovers on the next request. Initialization/reset races are covered by regression tests.
- A leading keyword check allowed extra statements and user PRAGMAs. SQLite query_only is now enabled, and a single SELECT/WITH statement is enforced before execution. Leading comments work, including the final assignment's starter.
- The original row cap happened after collecting the full result. The engine now collects at most 100 rows and identifies truncation; incomplete results cannot pass assessment.
- Grading rejected correct queries with reordered columns. It now aligns requested column names, preserves row multiplicity and value types, and respects ordered versus unordered missions. Feedback distinguishes column, row-count and value differences.
- Draft effects could overwrite a mission when navigating. Drafts now belong to mission IDs; the selected mission and completion are restored. IndexedDB and a localStorage mirror handle refreshes, migration, unavailable storage and malformed progress.
- The UI omitted existing stories, explanations and solutions. They are now visible with progressive hints, an optional solution, actual database schema, a next-mission action and end-of-chapter reflection. Keyboard focus, editor labeling, live feedback and mobile overflow are covered.
- Installation was not locked, and CI called a missing script. A committed lockfile and npm ci make dependency installation repeatable; CI gates deployment on database, unit, type, build and Chromium checks at the Pages path.

## Validation and remaining release work

Automated checks exercise actual SQLite queries, grading, persistence, worker timeout/recovery, and the full five-mission browser journey. Production browser checks use the GitHub Pages base path and block optional remote fonts.

Automation does not establish teaching effectiveness. Before calling this a finished course, observe a beginner completing the missions, verify that they can write a fresh two-column query without copying, and adjust the pacing. Also complete manual Safari, keyboard-only and VoiceOver checks and confirm the live GitHub Pages deployment. These remaining checks are tracked in `MVP_CHECKLIST.md`.
