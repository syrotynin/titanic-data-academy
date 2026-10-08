# Curriculum and development roadmap

## Eight-chapter curriculum

| Chapter | Narrative | Data skills | Status |
| --- | --- | --- | --- |
| 1. The Passenger Manifest | Inspect the archival ledger | Tables, columns, rows, SELECT, FROM, LIMIT | **Implemented (starter)** |
| 2. The Passenger Office | Find specific passengers | WHERE, AND/OR, comparisons, ORDER BY | Planned |
| 3. Ship's Accounting | Examine ticket sales | COUNT, SUM, AVG, GROUP BY, HAVING | Planned |
| 4. The Ticket Registry | Connect tickets and cabins | PK/FK, JOIN, relationships | Planned |
| 5. Missing Records | Audit inconsistent documents | NULL, duplicates, COALESCE, data quality | Planned |
| 6. Rebuild the Database | Improve schema design | Normalization, CREATE TABLE, INSERT/UPDATE, constraints | Planned |
| 7. Historical Investigation | Analyze provenance-aware data | CTEs, window functions, analytical caveats | Planned |
| 8. The Final Report | Deliver a stakeholder briefing | ETL/ELT, star schemas, BI, KPIs, communication | Planned |

Later chapters can introduce verified historical data with rigorous source and licensing checks. Survival records should be studied with dignity and attention to missing data, uncertainty and sample bias.

## Delivery milestones

### Milestone A — Technical proof (v0.1)

- [x] Vite/React app scaffold
- [x] `sql.js` worker client and timeout implementation
- [x] Fictional SQLite practice dataset
- [x] Editor, query results, schema explorer
- [x] Chapter 1 content, hints and result-based grader
- [x] Local progress persistence
- [x] GitHub Pages workflow configuration
- [x] Locked npm installation, SQL/grading/worker/storage tests, and TypeScript/production build
- [x] Automated Chromium learner journey at development and GitHub Pages paths
- [ ] Browser manual testing on Safari, Chrome and mobile
- [ ] Confirm GitHub Pages settings and live deployment

### Milestone B — Learner pilot

- [ ] Learner completes Chapter 1 without assistance
- [ ] Record confusion points and feedback
- [ ] Improve exercise difficulty/feedback, styling and accessibility
- [ ] Refactor large UI component after design stabilizes

### Milestone C — SQL foundations

- [ ] Build chapters 2–4
- [x] Add Chapter 1 query grading regression tests
- [ ] Extend grading cases and datasets for later chapters
- [ ] Teach JOIN through a normalized, multi-table dataset

### Milestone D — Data fundamentals

- [ ] Build chapters 5–8
- [ ] Add historical datasets with documented source/licensing
- [ ] Add data-model diagrams, ETL simulations, final BA report

### Beyond MVP

AI tutor (secure backend required), account sync, selectable SQL dialects, Power BI export and reporting, richer illustrations.
