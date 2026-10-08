# Titanic Data Academy ⚓

**Learn SQL by exploring an ocean liner's records.** A story-driven, hands-on data fundamentals course with a *real* SQL editor and SQLite running inside your browser.

> **Status:** v0.1 starter project. Chapter 1 (five interactive missions) is implemented. Chapters 2–8 are planned. The training passengers in Chapter 1 are **fictional** and must not be represented as genuine Titanic passenger records.

## What's inside

- Atmospheric Edwardian/Titanic-inspired opening and research missions.
- Real SQL execution with `sql.js` WebAssembly inside a Web Worker.
- Interactive CodeMirror editor, results grid, and database schema explorer.
- Two separate actions: **Run query** for exploration and **Check answer** for assessment.
- Query *result-based* grading, stepwise hints, and optional solutions.
- IndexedDB progress and draft query persistence (localStorage fallback).
- Read-only sample data and a five-second timeout that terminates stalled workers.
- React, TypeScript, Vite; static deployment to GitHub Pages.

## Run locally

You need Node.js 22.6 or newer (Node 22 recommended).

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To verify before deployment:

```bash
npm test
npm run typecheck
npm run build
npm run preview
```

**Note:** The SQLite WASM file is bundled from the `sql.js` npm package by Vite. It is not fetched from a third-party runtime CDN. The only external UI dependency at runtime is optional Google Fonts; CSS provides local fallbacks.

## Put this in a new GitHub repository

Create an **empty** repository called `titanic-data-academy` in the `syrotynin` account (do not initialize it with a README or license), then from this project directory:

```bash
git init
git add .
git commit -m "feat: scaffold Titanic Data Academy chapter 1"
git branch -M main
git remote add origin https://github.com/syrotynin/titanic-data-academy.git
git push -u origin main
```

On GitHub, go to **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source. `.github/workflows/pages.yml` tests, builds, and deploys on pushes to `main`.

Expected site URL after a successful deployment:

`https://syrotynin.github.io/titanic-data-academy/`

Pages visibility depends on GitHub plan and repository visibility. A public repository is the simplest zero-cost option for the learning project; don't put private information in it.

## Project guide

| Document | Purpose |
| --- | --- |
| [Product specification](docs/PRODUCT_SPEC.md) | Audience, goals, UX requirements, scope and acceptance criteria |
| [Chapter 1 experience](docs/CHAPTER_1.md) | Narrative, learning outcomes, five exercises, success criteria |
| [Architecture](docs/ARCHITECTURE.md) | Application modules, workers, grading, persistence, deployment |
| [Roadmap](docs/ROADMAP.md) | Eight-chapter curriculum and development milestones |
| [Data ethics and provenance](docs/DATA_PROVENANCE.md) | Fictional training records vs historical datasets |
| [MVP task list](docs/MVP_CHECKLIST.md) | Remaining checks before first real use |

## Folder structure

```
content/           structured lesson content (JSON)
docs/              specification, curriculum and architecture
public/data/       generated SQLite practice database and CSV source
scripts/           reproducible dataset generator
src/               React application, SQL worker, grading and IndexedDB
src/styles/        Titanic-inspired UI styling
tests/             content integrity tests
.github/workflows/ GitHub Pages deployment workflow
```

## What's deliberately deferred

Cloud accounts, multi-device sync, AI tutor, Power BI, instructor dashboards, and additional chapters. Keep the learning loop useful before extending the platform.

## Historical and copyright note

This educational project is inspired by the **historical RMS Titanic**, not affiliated with White Star Line rights holders or any film production. Do not add copyrighted film clips, film music or movie stills without appropriate permissions. Chapters that use real records should cite original repositories and respect licenses.
