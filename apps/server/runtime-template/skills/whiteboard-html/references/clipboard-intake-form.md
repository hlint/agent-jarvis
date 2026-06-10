# Clipboard Intake Form

Temporary form to collect structured user input on the whiteboard. On submit, validates with Zod and copies JSON to the clipboard so the user can paste it into the chat.

No persistence — state lives in React until copied.

## Full HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Information Collection</title>
  <script
    src="/jarvis/file?path=.jarvis/whiteboard/bootstrap.js"
    data-jarvis-deps="tailwind,react,babel,zod,lucide"
  ></script>
</head>
<body class="min-h-screen bg-background text-foreground antialiased">
  <div id="root" class="mx-auto w-full max-w-md p-4"></div>
  <script type="text/babel">
    const { z } = Zod;

    const formSchema = z.object({
      name: z.string().trim().min(1, "Please enter your name").max(50),
      email: z.string().trim().email("Invalid email format"),
      role: z.enum(["developer", "designer", "pm", "other"], {
        errorMap: () => ({ message: "Please select a role" }),
      }),
      notes: z.string().max(500).optional(),
    });

    const ROLE_LABELS = {
      developer: "Developer",
      designer: "Designer",
      pm: "Product",
      other: "Other",
    };

    const emptyForm = { name: "", email: "", role: "", notes: "" };

    function Field({ label, error, children }) {
      return (
        <label className="block space-y-1">
          <span className="text-sm text-muted-foreground">{label}</span>
          {children}
          {error && <span className="block text-xs text-destructive">{error}</span>}
        </label>
      );
    }

    function App() {
      const [form, setForm] = React.useState(emptyForm);
      const [errors, setErrors] = React.useState({});
      const [copied, setCopied] = React.useState(false);

      React.useEffect(() => {
        jarvis.createIcons();
      }, [copied]);

      const set = (key) => (e) => {
        setForm(f => ({ ...f, [key]: e.target.value }));
        setErrors(er => ({ ...er, [key]: undefined }));
        setCopied(false);
      };

      const handleCopy = async () => {
        const parsed = formSchema.safeParse(form);
        if (!parsed.success) {
          const next = {};
          parsed.error.errors.forEach(err => {
            const key = err.path[0];
            if (key && !next[key]) next[key] = err.message;
          });
          setErrors(next);
          return;
        }
        setErrors({});
        const payload = {
          ...parsed.data,
          roleLabel: ROLE_LABELS[parsed.data.role],
          collectedAt: new Date().toISOString(),
        };
        const text = JSON.stringify(payload, null, 2);
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          setErrors({ _form: "Cannot access clipboard — copy the JSON below manually" });
        }
      };

      return (
        <div className="space-y-4">
          <header>
            <h1 className="flex items-center gap-2 text-lg font-semibold">
              <i data-lucide="clipboard-list" className="size-5 text-primary"></i>
              Information Collection
            </h1>
            <p className="text-sm text-muted-foreground">
              Fill in the form, copy JSON, and paste into chat on the left
            </p>
          </header>

          <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <Field label="Name" error={errors.name}>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={form.name}
                onChange={set("name")}
                placeholder="Jane Doe"
              />
            </Field>

            <Field label="Email" error={errors.email}>
              <input
                type="email"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
              />
            </Field>

            <Field label="Role" error={errors.role}>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={form.role}
                onChange={set("role")}
              >
                <option value="">Select…</option>
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>

            <Field label="Notes (optional)" error={errors.notes}>
              <textarea
                rows={3}
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={form.notes}
                onChange={set("notes")}
                placeholder="Additional details…"
              />
            </Field>
          </div>

          {errors._form && (
            <p className="text-sm text-destructive">{errors._form}</p>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <i
              data-lucide={copied ? "clipboard-check" : "clipboard-copy"}
              className="size-4"
            ></i>
            {copied ? "Copied to clipboard" : "Copy JSON to clipboard"}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            After copying, Ctrl+V in the chat box to send to Jarvis
          </p>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById("root")).render(<App />);
  </script>
</body>
</html>
```

## When to use

- Agent needs structured answers (preferences, config, survey) without a backend
- User fills the form on whiteboard → pastes JSON into chat → agent continues with validated data

## Customization

- Adjust `formSchema` fields to match the task
- Add `_meta.intent` in payload if agent needs context
- For fallback when clipboard fails, render `<pre>` with JSON for manual copy

## UX tips

- Tell the user in chat: "Please fill out the form on the whiteboard on the right, click copy when done, and paste it back here"
- Keep field count small (3–6) for narrow panel
