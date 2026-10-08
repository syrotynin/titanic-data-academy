import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";

const DesktopSqlEditor = lazy(() => import("./DesktopSqlEditor"));
const shortcuts = ["SELECT", "FROM", "LIMIT", "*", ",", ";", "New line"];

type Props = {
  value: string;
  onChange: (value: string) => void;
  busy: boolean;
  ready: boolean;
  task: string;
  columns: string[];
  onRun: (assessment?: boolean) => void;
  message: string;
  isError: boolean;
};

export function SqlEditor(props: Props) {
  const [compact, setCompact] = useState(
    () => matchMedia("(max-width: 750px)").matches,
  );
  const [expanded, setExpanded] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const code = useRef<ReactCodeMirrorRef>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const selection = useRef({ from: 0, to: 0 });

  useEffect(() => {
    const media = matchMedia("(max-width: 750px)");
    const update = () => setCompact(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!expanded || !dialog.current) return;
    const modal = dialog.current;
    modal.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const viewport = window.visualViewport;
    const fitKeyboard = () => {
      modal.style.setProperty(
        "--editor-height",
        `${viewport?.height ?? innerHeight}px`,
      );
      modal.style.setProperty("--editor-top", `${viewport?.offsetTop ?? 0}px`);
    };
    fitKeyboard();
    viewport?.addEventListener("resize", fitKeyboard);
    viewport?.addEventListener("scroll", fitKeyboard);
    if (textarea.current) {
      textarea.current.focus({ preventScroll: true });
      textarea.current.setSelectionRange(
        selection.current.from,
        selection.current.to,
      );
    } else if (code.current?.view) {
      code.current.view.dispatch({
        selection: {
          anchor: selection.current.from,
          head: selection.current.to,
        },
      });
      code.current.view.focus();
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      viewport?.removeEventListener("resize", fitKeyboard);
      viewport?.removeEventListener("scroll", fitKeyboard);
      modal.close();
    };
  }, [expanded]);

  function expand() {
    const field = textarea.current;
    const range = code.current?.view?.state.selection.main;
    selection.current = field
      ? { from: field.selectionStart, to: field.selectionEnd }
      : { from: range?.from ?? 0, to: range?.to ?? 0 };
    setExpanded(true);
  }

  function close() {
    setExpanded(false);
    // The inline editor is remounted when the native dialog closes.
    requestAnimationFrame(() =>
      expandButton.current?.focus({ preventScroll: true }),
    );
  }

  function insert(token: string) {
    if (props.busy) return;
    const field = textarea.current;
    const view = code.current?.view;
    const from = field?.selectionStart ?? view?.state.selection.main.from ?? 0;
    const to = field?.selectionEnd ?? view?.state.selection.main.to ?? from;
    const before = props.value.slice(0, from);
    const after = props.value.slice(to);
    let text = token === "New line" ? "\n" : token;
    if (token !== "New line" && token !== "," && token !== ";") {
      text = `${before && !/[\s(]$/.test(before) ? " " : ""}${token}${after.startsWith(" ") ? "" : " "}`;
    } else if (token === ",") text = ", ";
    if (field) {
      field.focus({ preventScroll: true });
      field.setRangeText(text, from, to, "end");
      props.onChange(field.value);
    } else if (view) {
      view.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length },
        userEvent: "input",
      });
      view.focus();
    }
  }

  const editor = (
    <div className="editor-frame">
      <div className="editor-tab">
        <span>
          <span aria-hidden="true">≡</span> passenger_query.sql
        </span>
        <span>SQL</span>
      </div>
      <div className="sql-shortcuts" role="group" aria-label="SQL shortcuts">
        {shortcuts.map((token) => (
          <button
            key={token}
            type="button"
            disabled={props.busy}
            aria-label={`Insert ${token.toLowerCase()}`}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => insert(token)}
          >
            {token === "New line" ? "↵" : token}
          </button>
        ))}
        <select
          aria-label="Insert table or column"
          value=""
          disabled={props.busy}
          onChange={(event) => insert(event.target.value)}
        >
          <option value="" disabled>
            Table / column +
          </option>
          <option value="passengers">passengers (table)</option>
          {props.columns.map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </select>
      </div>
      {compact ? (
        <textarea
          ref={textarea}
          className="mobile-sql-input"
          aria-label="SQL query"
          aria-describedby={expanded ? "expanded-task" : "editor-help"}
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
          readOnly={props.busy}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
        />
      ) : (
        <Suspense
          fallback={
            <p className="editor-loading" role="status">
              Opening SQL editor…
            </p>
          }
        >
          <DesktopSqlEditor
            ref={code}
            value={props.value}
            onChange={props.onChange}
            busy={props.busy}
            expanded={expanded}
            selection={selection.current}
          />
        </Suspense>
      )}
    </div>
  );

  return (
    <>
      <div className="editor-options">
        <span>
          {compact
            ? "Tap to type, or use the SQL shortcuts below."
            : "Write your query. Follow the clues in the records."}
        </span>
        <button ref={expandButton} className="expand-editor" onClick={expand}>
          Expand editor
        </button>
      </div>
      {!expanded && editor}
      {expanded && (
        <dialog
          ref={dialog}
          className="expanded-editor"
          aria-labelledby="expanded-heading"
          onCancel={(event) => {
            event.preventDefault();
            close();
          }}
        >
          <div className="expanded-header">
            <h2 id="expanded-heading">Your SQL query</h2>
            <button onClick={close}>Done editing</button>
          </div>
          <p className="expanded-task" id="expanded-task">
            {props.task}
          </p>
          {editor}
          <div className="expanded-actions actions">
            <button
              disabled={props.busy || !props.ready}
              onClick={() => props.onRun()}
            >
              ▶ Run query
            </button>
            <button
              className="primary"
              disabled={props.busy || !props.ready}
              onClick={() => props.onRun(true)}
            >
              ✓ Check answer
            </button>
          </div>
          <p
            className={`expanded-message ${props.isError ? "is-error" : ""}`}
            role="status"
          >
            {props.busy
              ? "Running query…"
              : props.message ||
                "Your draft is kept when you return to the lesson."}
          </p>
        </dialog>
      )}
    </>
  );
}
