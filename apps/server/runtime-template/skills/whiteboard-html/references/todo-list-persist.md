# Todo List with Persistence

Complete single-file example: load/save JSON via Jarvis file API, Zod validation, controlled form input, submit handler, debounced auto-save.

**Data file** (create empty array first or let first save create it):

```json
[]
```

Path used below: `workspace/demo/data/todos.json` — change `DATA_PATH` to match your project.

## Full HTML

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Todo · Persistence</title>
    <script
      src="/jarvis/file?path=.jarvis/whiteboard/bootstrap.js"
      data-jarvis-deps="tailwind,react,babel,zod,lucide"
    ></script>
  </head>
  <body class="min-h-screen bg-background text-foreground antialiased">
    <div id="root" class="mx-auto w-full max-w-md p-4"></div>
    <script type="text/babel">
      const { z } = Zod;

      const DATA_PATH = "workspace/demo/data/todos.json";

      const todoSchema = z.object({
        id: z.string(),
        text: z.string().min(1).max(200),
        done: z.boolean(),
      });
      const todosSchema = z.array(todoSchema);
      const addInputSchema = z
        .string()
        .trim()
        .min(1, "Please enter a task")
        .max(200, "Maximum 200 characters");

      async function readTodos() {
        const raw = await jarvis.read(DATA_PATH, { default: "[]", as: "json" });
        return todosSchema.parse(raw);
      }

      async function writeTodos(todos) {
        const validated = todosSchema.parse(todos);
        await jarvis.writeTextFile(
          DATA_PATH,
          JSON.stringify(validated, null, 2),
        );
      }

      function useDebouncedSave(todos) {
        const [status, setStatus] = React.useState("idle"); // idle | saving | saved | error
        const skipFirst = React.useRef(true);

        React.useEffect(() => {
          if (skipFirst.current) {
            skipFirst.current = false;
            return;
          }
          setStatus("saving");
          writeTodos(todos)
            .then(() => setStatus("saved"))
            .catch(() => setStatus("error"));
        }, [todos]);

        return status;
      }

      function App() {
        const [todos, setTodos] = React.useState([]);
        const [input, setInput] = React.useState("");
        const [fieldError, setFieldError] = React.useState("");
        const [loadError, setLoadError] = React.useState("");
        const [loading, setLoading] = React.useState(true);
        const saveStatus = useDebouncedSave(todos);

        React.useEffect(() => {
          jarvis.createIcons();
        }, [todos.length, saveStatus]);

        React.useEffect(() => {
          readTodos()
            .then(setTodos)
            .catch(() => setLoadError("Unable to load data"))
            .finally(() => setLoading(false));
        }, []);

        const handleSubmit = (e) => {
          e.preventDefault();
          const parsed = addInputSchema.safeParse(input);
          if (!parsed.success) {
            setFieldError(parsed.error.errors[0]?.message || "Invalid input");
            return;
          }
          setFieldError("");
          setTodos((t) => [
            ...t,
            { id: crypto.randomUUID(), text: parsed.data, done: false },
          ]);
          setInput("");
        };

        const toggle = (id) =>
          setTodos((t) =>
            t.map((item) =>
              item.id === id ? { ...item, done: !item.done } : item
            )
          );

        const remove = (id) =>
          setTodos((t) => t.filter((item) => item.id !== id));

        if (loading) {
          return <p className="text-sm text-muted-foreground">Loading…</p>;
        }

        return (
          <div className="space-y-4">
            <header className="flex items-center justify-between">
              <div>
                <h1 className="flex items-center gap-2 text-lg font-semibold">
                  <i data-lucide="list-todo" className="size-5 text-primary"></i>
                  Todo
                </h1>
                <p className="text-xs text-muted-foreground">
                  Auto-save · {DATA_PATH}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {saveStatus === "saving" && "Saving…"}
                {saveStatus === "saved" && "Saved"}
                {saveStatus === "error" && "Save failed"}
              </span>
            </header>

            {loadError && (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {loadError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                className="flex-1 rounded-md border border-input bg-card px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setFieldError("");
                }}
                placeholder="New task…"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <i data-lucide="plus" className="size-4"></i>
                Add
              </button>
            </form>
            {fieldError && (
              <p className="text-xs text-destructive">{fieldError}</p>
            )}

            <ul className="space-y-1 rounded-lg border border-border bg-card p-2">
              {todos.length === 0 && (
                <li className="py-6 text-center text-sm text-muted-foreground">
                  No tasks yet
                </li>
              )}
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => toggle(todo.id)}
                    className="size-4 accent-primary"
                  />
                  <span
                    className={`flex-1 text-sm ${todo.done ? "text-muted-foreground line-through" : ""}`}
                  >
                    {todo.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(todo.id)}
                    className="flex items-center gap-1 text-xs text-destructive hover:underline"
                    title="Delete"
                  >
                    <i data-lucide="trash-2" className="size-3.5"></i>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      }

      ReactDOM.createRoot(document.getElementById("root")).render(<App />);
    </script>
  </body>
</html>
```

## API recap

Provided by `.jarvis/whiteboard/bootstrap.js` (no extra `<script>` / `<link>` needed beyond `data-jarvis-deps`):

| Method | Usage |
| ------ | ----- |
| `jarvis.read(path, options?)` | Read file text. `options.as: "json"` parses JSON. `options.default` returned on 404 instead of throwing. |
| `jarvis.writeTextFile(path, content, options?)` | Write file. Default `debounce: 600` (ms). Pass `debounce: false` or `0` for immediate write. |
| `jarvis.flushWrite(path)` | Flush a pending debounced write immediately. |

Low-level HTTP (rarely needed if shared script is loaded):

| Action | Request                                                              |
| ------ | -------------------------------------------------------------------- |
| Read   | `GET /jarvis/file?path=workspace/demo/data/todos.json`               |
| Write  | `POST /jarvis/file-write` body `{ "path": "...", "content": "..." }` |

## Notes

- Ensure `workspace/demo/data/` exists (`ensure_dir`) before first navigation
- `useDebouncedSave` skips the initial mount so load doesn't trigger a write; debouncing is handled by `jarvis.writeTextFile`
- Zod validates both loaded data and outgoing payloads
- Toggle/delete auto-save via the same debounced effect
