import { useEffect, useMemo, useState } from "react";
import { AnchorMark, ShipIllustration } from "./components/NauticalArtwork";
import { SqlEditor } from "./components/SqlEditor";
import chapter from "../content/chapter-01.json";
import { SqlClient } from "./lib/sqlClient";
import { grade } from "./lib/grading";
import { loadProgress, saveProgress } from "./lib/progress";
import type { Progress } from "./lib/progress";
import type { Mission, Output, SchemaColumn } from "./lib/types";

const missions: Mission[] = chapter.lessons;
const ids = missions.map((mission) => mission.id);
export default function App() {
  const client = useMemo(
    () =>
      new SqlClient(
        new URL(
          `${import.meta.env.BASE_URL}data/titanic-ch01.sqlite`,
          location.origin,
        ).href,
      ),
    [],
  );
  const [progress, setProgress] = useState<Progress | null>(null);
  const [schema, setSchema] = useState<SchemaColumn[]>([]);
  const [engineReady, setEngineReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<{
    text: string;
    correct?: boolean;
  } | null>(null);
  const [result, setResult] = useState<Output | null>(null);
  const [hint, setHint] = useState(0);
  const [solution, setSolution] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  useEffect(() => {
    let active = true;
    void loadProgress(ids).then((value) => {
      if (active) setProgress(value);
    });
    void client
      .initialize()
      .then((value) => {
        if (active && "schema" in value) {
          setSchema(value.schema);
          setEngineReady(true);
        }
      })
      .catch((reason) => {
        if (active) setError(String(reason.message));
      });
    return () => {
      active = false;
      client.stop();
    };
  }, [client]);
  function persist(next: Progress) {
    setProgress(next);
    void saveProgress(next).then((saved) => setStorageWarning(!saved));
  }
  if (!progress)
    return (
      <main className="loading" role="status">
        Opening the practice archive…
      </main>
    );
  const index = missions.findIndex(
    (mission) => mission.id === progress.selected,
  );
  const mission = missions[index];
  const query = progress.drafts[mission.id] ?? mission.starterSql;
  function edit(value: string) {
    persist({
      ...progress!,
      drafts: { ...progress!.drafts, [mission.id]: value },
    });
    setFeedback(null);
  }
  function select(next: Mission) {
    persist({ ...progress!, selected: next.id });
    setResult(null);
    setFeedback(null);
    if (engineReady) setError("");
    setHint(0);
    setSolution(false);
  }
  async function execute(assessment = false) {
    setBusy(true);
    setError("");
    setFeedback(null);
    try {
      const output = await client.query(
        query,
        assessment ? mission.referenceSql : undefined,
      );
      setResult(output.actual);
      if (assessment && output.expected) {
        const verdict = grade(
          output.actual,
          output.expected,
          mission.orderMatters,
        );
        setFeedback({ text: verdict.message, correct: verdict.correct });
        if (verdict.correct && !progress!.done.includes(mission.id)) {
          persist({ ...progress!, done: [...progress!.done, mission.id] });
        }
      } else
        setFeedback({
          text: "Query executed. Check answer when you are ready.",
        });
    } catch (reason) {
      setResult(null);
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }
  async function resetEngine() {
    setBusy(true);
    setError("");
    setEngineReady(false);
    setResult(null);
    client.stop();
    try {
      const response = await client.initialize();
      if ("schema" in response) {
        setSchema(response.schema);
        setEngineReady(true);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }
  const complete = progress.done.length === missions.length;
  return (
    <main>
      <a className="skip-link" href="#sql-workspace">
        Skip to SQL workspace
      </a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Titanic Data Academy home">
          <span className="brand-emblem">
            <AnchorMark />
          </span>
          <span>
            TITANIC<span className="brand-subtitle">DATA ACADEMY</span>
          </span>
        </a>
        <nav className="header-nav" aria-label="Main navigation">
          <a href="#records-room">The records room</a>
          <a href="#sql-workspace">
            SQL workspace <span aria-hidden="true">→</span>
          </a>
        </nav>
        <span className="header-edition">
          A JOURNEY THROUGH DATA <span>R.M.S. TITANIC · 1912</span>
        </span>
      </header>
      <section className="hero" id="top" aria-labelledby="chapter-title">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="ornament-line" /> THE HISTORICAL ARCHIVE ·
              CHAPTER I
            </p>
            <h1 id="chapter-title">
              {chapter.title.split(" ").slice(0, -1).join(" ")}{" "}
              <em>{chapter.title.split(" ").at(-1)}</em>
            </h1>
            <p className="hero-description">
              Every passenger has a story. Every record holds a clue. Step into
              the records room and learn SQL, one discovery at a time.
            </p>
            <div className="hero-meta">
              <span>BEGINNER FRIENDLY</span>
              <span>{missions.length} MISSIONS</span>
              <span>REAL SQL</span>
            </div>
          </div>
          <div className="hero-art">
            <div className="archive-label">
              <span>MARITIME COLLECTION</span>
              <span>VOL. 01 / 1912</span>
            </div>
            <ShipIllustration />
          </div>
        </div>
      </section>
      <section className="passage-ticket" aria-label="Your learning passage">
        <div className="ticket-chapter">
          <span className="eyebrow">CHAPTER</span>
          <strong>01</strong>
        </div>
        <div className="ticket-title">
          <p className="eyebrow">YOUR LEARNING PASSAGE</p>
          <h2>{chapter.subtitle}</h2>
          <p>No experience needed. Just a little curiosity.</p>
        </div>
        <div className="ticket-progress">
          <div className="progress-label">
            <span>YOUR PROGRESS</span>
            <strong>
              {progress.done.length} / {missions.length}
            </strong>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-label="Chapter completion"
            aria-valuemin={0}
            aria-valuemax={missions.length}
            aria-valuenow={progress.done.length}
          >
            <div
              style={{
                width: `${(100 * progress.done.length) / missions.length}%`,
              }}
            />
          </div>
          <small>
            {progress.done.length} of {missions.length} missions completed
          </small>
        </div>
        <a className="journey-link" href="#lesson">
          {Object.keys(progress.drafts).length || progress.done.length
            ? "Continue journey"
            : "Begin journey"}
          <span aria-hidden="true">→</span>
        </a>
      </section>
      <div className="records-heading" id="records-room">
        <p className="eyebrow">THE RECORDS ROOM</p>
        <span>Explore. Query. Discover.</span>
      </div>
      <div className="layout">
        <aside className="missions-sidebar" aria-label="Chapter missions">
          <div className="sidebar-heading">
            <p className="eyebrow">YOUR COURSE</p>
            <h2>A course to discovery</h2>
            <p>SQL & Data Fundamentals</p>
          </div>
          <nav aria-label="Your missions">
            {missions.map((m) => (
              <button
                key={m.id}
                disabled={busy}
                className={`mission ${m.id === mission.id ? "active" : ""}`}
                aria-current={m.id === mission.id ? "step" : undefined}
                onClick={() => select(m)}
              >
                <span
                  className={`mission-number ${progress.done.includes(m.id) ? "done" : ""}`}
                  aria-hidden="true"
                >
                  {progress.done.includes(m.id)
                    ? "✓"
                    : String(m.number).padStart(2, "0")}
                </span>
                <span className="mission-label">
                  {m.title}
                  <small>
                    {m.kind === "concept"
                      ? "The foundations"
                      : m.kind === "challenge"
                        ? "Put it all together"
                        : "Guided practice"}
                  </small>
                </span>
                {m.id === mission.id && (
                  <span className="mission-arrow" aria-hidden="true">
                    ›
                  </span>
                )}
                {progress.done.includes(m.id) && (
                  <span className="sr-only"> (completed)</span>
                )}
              </button>
            ))}
          </nav>
          <div className="sidebar-note">
            <span className="saved-indicator" aria-hidden="true" />
            <p className="note">
              Progress and query drafts are saved in this browser.
            </p>
          </div>
          {storageWarning && (
            <p role="alert" className="error">
              Browser storage is unavailable. Your work will last only for this
              visit.
            </p>
          )}
          <div className="archive-note">
            <AnchorMark />
            <p className="eyebrow">A NOTE FROM THE ARCHIVE</p>
            <p>{chapter.historicalNote}</p>
          </div>
        </aside>
        <section className="workspace" aria-label="Learning workspace">
          <article className="panel lesson-panel" id="lesson">
            <div className="lesson-heading">
              <p className="eyebrow">
                ASSIGNMENT {String(mission.number).padStart(2, "0")}{" "}
                <span>/ {String(missions.length).padStart(2, "0")}</span>
              </p>
              <span className="lesson-kind">
                {mission.kind === "concept"
                  ? "THE FOUNDATIONS"
                  : mission.kind === "challenge"
                    ? "THE CHALLENGE"
                    : "GUIDED PRACTICE"}
              </span>
            </div>
            <h2>{mission.title}</h2>
            <p className="lesson-goal">
              <strong>Your goal:</strong> {mission.objective}
            </p>
            <p className="lesson-story">{mission.story}</p>
            <div className="concept">
              <h3>The SQL concept</h3>
              <p>{mission.explanation}</p>
            </div>
            <div className="task">
              <span className="task-mark" aria-hidden="true">
                ›
              </span>
              <div>
                <h3>Your task</h3>
                <p>{mission.task}</p>
              </div>
            </div>
            <details className="schema" open>
              <summary>Database explorer · passengers</summary>
              {schema.length ? (
                <>
                  <p>
                    24 fictional records <span aria-hidden="true">·</span>{" "}
                    Columns available in your query:
                  </p>
                  <ul>
                    {schema.map((column) => (
                      <li key={column.name}>
                        <code>{column.name}</code>{" "}
                        <span>
                          {column.type.toLowerCase()}
                          {column.primaryKey ? " · primary key" : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>Loading the database schema…</p>
              )}
            </details>
          </article>
          <section
            className="panel editor-panel"
            id="sql-workspace"
            aria-labelledby="sql-heading"
          >
            <div className="between">
              <h2 id="sql-heading">
                <span className="heading-symbol" aria-hidden="true">
                  ⌘
                </span>
                SQL workspace
              </h2>
              <small className={`engine-status ${engineReady ? "ready" : ""}`}>
                {busy
                  ? "Running…"
                  : engineReady
                    ? "SQLite · Read only"
                    : "Loading engine…"}
              </small>
            </div>
            <p className="editor-help" id="editor-help">
              Write one SELECT query. Run it to explore; check it to complete
              the mission. Press Tab to leave the editor.
            </p>
            <SqlEditor
              value={query}
              onChange={edit}
              busy={busy}
              ready={engineReady}
              task={mission.task}
              columns={schema.map((column) => column.name)}
              onRun={(assessment) => void execute(assessment)}
              message={
                error ||
                feedback?.text ||
                (result
                  ? `${result.values.length} rows returned. Done editing takes you back to the results.`
                  : "")
              }
              isError={Boolean(error) || feedback?.correct === false}
            />
            <div className="actions">
              <button
                onClick={() => void execute()}
                disabled={busy || !engineReady}
              >
                ▶ Run query
              </button>
              <button
                className="primary"
                onClick={() => void execute(true)}
                disabled={busy || !engineReady}
              >
                ✓ Check answer
              </button>
              <button
                disabled={busy}
                onClick={() => {
                  edit(mission.starterSql);
                  setResult(null);
                  setError("");
                }}
              >
                Reset query
              </button>
              <button disabled={busy} onClick={() => void resetEngine()}>
                Reset engine
              </button>
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div role="status" aria-live="polite">
              {feedback && (
                <p
                  className={
                    feedback.correct === false ? "incorrect" : "feedback"
                  }
                >
                  {feedback.text}
                </p>
              )}
              {feedback?.correct && <p>{mission.solutionExplanation}</p>}
            </div>
            <div className="actions help-actions">
              <button
                disabled={busy || hint === mission.hints.length}
                onClick={() => setHint(hint + 1)}
              >
                Reveal hint ({hint}/{mission.hints.length})
              </button>
              <button
                onClick={() => setSolution(!solution)}
                aria-expanded={solution}
              >
                {solution ? "Hide solution" : "Show solution"}
              </button>
            </div>
            {hint > 0 && (
              <ol className="hint">
                {mission.hints.slice(0, hint).map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ol>
            )}
            {solution && (
              <div className="hint">
                <pre>{mission.referenceSql}</pre>
                <p>{mission.solutionExplanation}</p>
                <button
                  disabled={busy}
                  onClick={() => edit(mission.referenceSql)}
                >
                  Use this query
                </button>
              </div>
            )}
            {progress.done.includes(mission.id) &&
              index < missions.length - 1 && (
                <button
                  className="next-mission"
                  disabled={busy}
                  onClick={() => select(missions[index + 1])}
                >
                  Next mission →
                </button>
              )}
          </section>
          <section
            className="panel results-panel"
            id="query-results"
            aria-labelledby="results-heading"
          >
            <div className="between">
              <h2 id="results-heading">Query results</h2>
              <small>
                {result
                  ? `${result.values.length}${result.truncated ? "+" : ""} rows`
                  : "Run a query to see results"}
              </small>
            </div>
            {result ? (
              <>
                {result.truncated && (
                  <p role="status">
                    Showing the first 100 rows. This incomplete result cannot be
                    graded correct.
                  </p>
                )}
                <div
                  className="scroll"
                  tabIndex={0}
                  role="region"
                  aria-label="SQL result table"
                >
                  <table>
                    <caption className="sr-only">
                      Query result: {result.values.length} displayed rows
                    </caption>
                    <thead>
                      <tr>
                        {result.columns.map((column, i) => (
                          <th scope="col" key={i}>
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.values.map((row, i) => (
                        <tr key={i}>
                          {row.map((value, j) => (
                            <td key={j}>
                              {value === null
                                ? "NULL"
                                : value instanceof Uint8Array
                                  ? `[binary: ${value.length} bytes]`
                                  : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!result.values.length && <p>No rows matched your query.</p>}
              </>
            ) : (
              <div className="empty">
                <span className="empty-ledger" aria-hidden="true">
                  ▤
                </span>
                <p>Your next discovery starts with a query.</p>
                <small>Your query results will appear here.</small>
              </div>
            )}
          </section>
          {complete && (
            <section className="panel reflection">
              <h2>Chapter 1 complete</h2>
              <p>
                You can select columns and limit a result. Before moving on, try
                explaining:
              </p>
              <ul>
                <li>How do a table, row, and column differ?</li>
                <li>What does FROM passengers tell the database?</li>
                <li>
                  Why might you select two columns instead of every column?
                </li>
                <li>Does LIMIT promise a particular row order?</li>
              </ul>
              <p>
                Next chapter: filtering and ordering. It is planned, and is not
                available yet.
              </p>
            </section>
          )}
        </section>
      </div>
      <footer className="site-footer">
        <div className="footer-brand">
          <AnchorMark />
          <span>TITANIC DATA ACADEMY</span>
        </div>
        <p>A little history. A new way to see data.</p>
        <small>
          Inspired by RMS Titanic · Fictional practice records · Not affiliated
          with any film production
        </small>
      </footer>
      <nav className="mobile-navigation" aria-label="Workspace shortcuts">
        <a href="#lesson">The lesson</a>
        <a href="#sql-workspace">Write SQL</a>
        <a href="#query-results">Results</a>
      </nav>
    </main>
  );
}
