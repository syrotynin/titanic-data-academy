import { forwardRef } from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { EditorView } from "@codemirror/view";

const extensions = [
  sql(),
  EditorView.lineWrapping,
  EditorView.contentAttributes.of({
    "aria-label": "SQL query",
    autocapitalize: "off",
    autocorrect: "off",
    spellcheck: "false",
  }),
];

type Props = {
  value: string;
  onChange: (value: string) => void;
  busy: boolean;
  expanded: boolean;
  selection: { from: number; to: number };
};

export default forwardRef<ReactCodeMirrorRef, Props>(
  function DesktopSqlEditor(props, ref) {
    return (
      <CodeMirror
        ref={ref}
        value={props.value}
        height={props.expanded ? "100%" : "210px"}
        extensions={extensions}
        indentWithTab={false}
        onChange={props.onChange}
        theme="dark"
        editable={!props.busy}
        onCreateEditor={(view) => {
          view.contentDOM.setAttribute(
            "aria-describedby",
            props.expanded ? "expanded-task" : "editor-help",
          );
          if (props.expanded) {
            view.dispatch({
              selection: {
                anchor: props.selection.from,
                head: props.selection.to,
              },
            });
            view.focus();
          }
        }}
      />
    );
  },
);
