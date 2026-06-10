# Chart + Code Highlight

Single-file example: **ECharts** bar chart with fixed data, plus a **highlight.js** code block showing the chart option JSON. Adapted from the html-view stack (charts + syntax highlighting), using whiteboard dark tokens.

Use when the user wants dashboards, metrics, or config/data shown beside a chart.

## Stack

Loaded via `data-jarvis-deps` on the bootstrap script:

| Dep | Purpose |
|-----|---------|
| `tailwind,react,babel,lucide` | UI shell + icons |
| `echarts` | Chart |
| `hljs` | Syntax highlighting (github-dark theme CSS) |

## Full HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Chart and Code</title>
  <script
    src="/jarvis/file?path=.jarvis/whiteboard/bootstrap.js"
    data-jarvis-deps="tailwind,react,babel,lucide,echarts,hljs"
  ></script>
  <style>
    pre code.hljs {
      background: transparent !important;
      padding: 0;
    }
  </style>
</head>
<body class="min-h-screen bg-background text-foreground antialiased">
  <div id="root" class="mx-auto w-full max-w-md p-4"></div>
  <script type="text/babel">
    const WEEKLY = [
      { day: "Mon", value: 62 },
      { day: "Tue", value: 74 },
      { day: "Wed", value: 58 },
      { day: "Thu", value: 91 },
      { day: "Fri", value: 83 },
      { day: "Sat", value: 45 },
      { day: "Sun", value: 38 },
    ];

    function buildChartOption(data) {
      return {
        backgroundColor: "transparent",
        grid: { left: 36, right: 12, top: 24, bottom: 28 },
        xAxis: {
          type: "category",
          data: data.map((d) => d.day),
          axisLine: { lineStyle: { color: "oklch(0.708 0 0 / 0.35)" } },
          axisLabel: { color: "oklch(0.708 0 0)", fontSize: 10 },
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { color: "oklch(1 0 0 / 6%)" } },
          axisLabel: { color: "oklch(0.708 0 0)", fontSize: 10 },
        },
        series: [
          {
            type: "bar",
            data: data.map((d) => d.value),
            itemStyle: {
              color: "oklch(0.77 0.2 131)",
              borderRadius: [4, 4, 0, 0],
            },
          },
        ],
        tooltip: {
          trigger: "axis",
          backgroundColor: "oklch(0.205 0 0)",
          borderColor: "oklch(1 0 0 / 10%)",
          textStyle: { color: "oklch(0.985 0 0)", fontSize: 12 },
        },
      };
    }

    const CHART_OPTION = buildChartOption(WEEKLY);

    function App() {
      const chartRef = React.useRef(null);
      const codeRef = React.useRef(null);
      const codeText = JSON.stringify(CHART_OPTION, null, 2);

      React.useEffect(() => {
        jarvis.createIcons();
      }, []);

      React.useEffect(() => {
        if (!chartRef.current || !window.echarts) return;
        const chart = window.echarts.init(chartRef.current);
        chart.setOption(CHART_OPTION);
        const onResize = () => chart.resize();
        window.addEventListener("resize", onResize);
        return () => {
          window.removeEventListener("resize", onResize);
          chart.dispose();
        };
      }, []);

      React.useEffect(() => {
        if (codeRef.current && window.hljs) {
          window.hljs.highlightElement(codeRef.current);
        }
      }, [codeText]);

      return (
        <div className="space-y-4">
          <header>
            <h1 className="flex items-center gap-2 text-lg font-semibold">
              <i data-lucide="bar-chart-3" className="size-5 text-primary"></i>
              Weekly activity
            </h1>
            <p className="text-sm text-muted-foreground">
              Fixed data · ECharts + highlight.js
            </p>
          </header>

          <section className="rounded-lg border border-border bg-card p-3">
            <div ref={chartRef} className="h-44 w-full" />
          </section>

          <section className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
              <i data-lucide="code" className="size-3.5"></i>
              ECharts option
            </div>
            <pre className="m-0 max-h-52 overflow-auto p-3 text-[11px] leading-relaxed">
              <code ref={codeRef} className="language-json">{codeText}</code>
            </pre>
          </section>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById("root")).render(<App />);
  </script>
</body>
</html>
```

## Notes

- Chart colors use Jarvis **primary** green (`oklch(0.77 0.2 131)`) and muted axis labels
- `echarts.init` + `resize` listener fits the ~480px whiteboard panel; call `chart.resize()` after layout changes
- For **line / pie / mixed** charts, keep the same pattern: fixed data → `buildChartOption()` → chart + optional highlighted JSON
- **D3** is an alternative for custom SVG (see html-view); prefer ECharts for standard charts
- Do not use `min-h-screen` on `html`/`body` if the page may later move to a chat iframe; whiteboard panel is fine with inner layout only

## When to extend

| Need | Action |
|------|--------|
| Live / editable data | `jarvis.read` + React state, update chart, `chart.setOption()` |
| Multiple code languages | Load extra `languages/*.min.js` from cdnjs (pin to highlight.js 11.11.1) |
| Alpine instead of React | Follow html-view starter: ECharts in `DOMContentLoaded`, `hljs.highlightAll()` at end of body |
