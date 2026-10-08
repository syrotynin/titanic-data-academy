# Product specification — v0.1

## Vision

A hybrid of Titanic historical storytelling and a serious SQL workspace: an adult beginner learns transferable data skills by working through investigations into an ocean liner's passenger records.

## Learner

- Primary: an experienced IT Business Analyst/Product Owner developing practical SQL and data literacy.
- Starting point: little or no SQL.
- Target: confidently retrieve, filter, join, aggregate, check and explain data in a business context.
- Tone: adult, curious, encouraging, respectful of a historical tragedy; never childish.

## Core product principles

1. **Every mission teaches a data skill.** Historical details make the exercise memorable, not distracting.
2. **SQL is real.** Execute actual statements against SQLite, not pretend query results.
3. **Exploration precedes assessment.** Run Query and Check Answer are separate actions.
4. **Feedback should explain.** Show useful SQL errors, result comparison, and progressive hints.
5. **Alternative valid queries are accepted.** Grade the result table instead of literal query text.
6. **Mistakes are reversible.** Read-only Chapter 1 database; reset drafts and engine.
7. **History is labeled.** Separate sourced history from fictional exercises and derived conclusions.
8. **Return tomorrow.** Persist solved lessons and working SQL without a user account.

## MVP user journeys

### Returning learner
1. Opens website, sees Continue Journey if progress exists.
2. Enters workspace and resumes the last selected mission.
3. Unfinished SQL draft has been restored.

### Solve a mission
1. Reads story and the core SQL concept.
2. Inspects the available schema.
3. Writes and runs a SELECT query, sees results.
4. If results are wrong, adjusts query or requests gradual hints.
5. Checks answer, receives explanation, and completes the mission.
6. Proceeds to the next lesson without page navigation or login.

## UX and accessibility

- Desktop first, responsive down to mobile screen widths.
- Easy keyboard navigation and visible focus states.
- Editor uses syntax highlighting and monospaced typography.
- Data results are accessible HTML tables with a scrollable region.
- Contrast should be checked manually before launch.
- No artificial penalty for wrong SQL or revealing solutions.

## Nonfunctional requirements

- Fully static hosting; no server runtime.
- SQL executed away from the main UI thread in a Web Worker.
- Hard five-second per-request timeout (terminate/reinitialize worker).
- Display at most 100 result rows per run.
- SQLite database is read-only for Chapter 1.
- Progress persists locally via IndexedDB, with fallback when unavailable.
- Public code and training data contain no personal learner information.

## Release 0.1 scope

One Chapter 1 story arc containing five exercises on tables, rows, columns, SELECT, FROM and LIMIT. Includes code editor, SQLite database, schema explorer, query results, solution validation, hints, reset, and progress.

### Explicit exclusions

- User authentication and cloud sync.
- AI-based tutoring or LLM API keys.
- Actual historical survivor analysis.
- INSERT/UPDATE/DELETE lessons or mutable database state.
- Power BI, external BI integrations and advanced statistics.

## Success criteria

- Learner completes all five exercises without assistance.
- Can explain table/row/column, SELECT, FROM and LIMIT in her own words.
- Can write a new query selecting two fields without copying a solution.
- Can recover from a typo/error and understand the feedback.
- Refreshing the page preserves completed missions and the editor draft.
