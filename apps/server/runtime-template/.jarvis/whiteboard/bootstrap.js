(() => {
  const STORAGE_KEY = "theme";
  const CSS_PATH = "/jarvis/file?path=.jarvis/whiteboard/theme.css";
  const DEFAULT_WRITE_DEBOUNCE_MS = 600;
  const LOADING_STYLE_ID = "jarvis-boot-style";
  /** Must match frontend WHITEBOARD_NAVIGATE_MESSAGE_TYPE */
  const WHITEBOARD_NAVIGATE_MESSAGE_TYPE = "jarvis:whiteboard-navigate";

  const resolveIsDark = (stored) => {
    const theme = stored == null || stored === "" ? "system" : stored;
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const readStoredTheme = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const applyTheme = () => {
    document.documentElement.classList.toggle(
      "dark",
      resolveIsDark(readStoredTheme()),
    );
  };

  /** Critical tokens before theme.css loads — keep background/foreground in sync with theme.css */
  const injectCriticalTheme = () => {
    if (document.getElementById(LOADING_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = LOADING_STYLE_ID;
    style.textContent = [
      ":root{--background:oklch(1 0 0);--foreground:oklch(0.145 0 0);color-scheme:light}",
      ".dark{--background:oklch(0.145 0 0);--foreground:oklch(0.925 0 0);color-scheme:dark}",
      "html{background:var(--background);color:var(--foreground)}",
      "html.jarvis-loading body{visibility:hidden}",
    ].join("");
    (document.head || document.documentElement).appendChild(style);
  };

  const markLoading = () => {
    injectCriticalTheme();
    document.documentElement.classList.add("jarvis-loading");
    document.documentElement.classList.remove("jarvis-ready");
  };

  injectCriticalTheme();
  applyTheme();
  markLoading();

  const markReady = () => {
    document.documentElement.classList.remove("jarvis-loading");
    document.documentElement.classList.add("jarvis-ready");
  };

  /** Pinned CDN URLs — bump versions here only; do not use @latest in pages */
  const CDN = {
    tailwind: "https://cdn.tailwindcss.com/3.4.17",
    react: "https://unpkg.com/react@18.3.1/umd/react.development.js",
    "react-dom":
      "https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js",
    babel: "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js",
    zod: "https://cdn.jsdelivr.net/npm/zod@3.23.8/lib/index.umd.js",
    echarts: "https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.min.js",
    lucide: "https://unpkg.com/lucide@1.17.0/dist/umd/lucide.min.js",
    "hljs-css":
      "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css",
    hljs: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js",
    "hljs-json":
      "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/languages/json.min.js",
  };

  /** Semantic color tokens exposed to Tailwind — keep in sync with theme.css */
  const THEME_COLORS = {
    background: "var(--background)",
    foreground: "var(--foreground)",
    card: {
      DEFAULT: "var(--card)",
      foreground: "var(--card-foreground)",
    },
    primary: {
      DEFAULT: "var(--primary)",
      foreground: "var(--primary-foreground)",
    },
    secondary: {
      DEFAULT: "var(--secondary)",
      foreground: "var(--secondary-foreground)",
    },
    muted: {
      DEFAULT: "var(--muted)",
      foreground: "var(--muted-foreground)",
    },
    accent: {
      DEFAULT: "var(--accent)",
      foreground: "var(--accent-foreground)",
    },
    destructive: "var(--destructive)",
    border: "var(--border)",
    input: "var(--input)",
    ring: "var(--ring)",
  };

  const THEME_COLOR_TOKENS = [
    "background",
    "foreground",
    "card",
    "card-foreground",
    "primary",
    "primary-foreground",
    "secondary",
    "secondary-foreground",
    "muted",
    "muted-foreground",
    "accent",
    "accent-foreground",
    "destructive",
    "border",
    "input",
    "ring",
  ];

  const loaded = Object.create(null);
  const loading = Object.create(null);
  let readyPromise = null;

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) applyTheme();
  });

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      const stored = readStoredTheme();
      const theme = stored == null || stored === "" ? "system" : stored;
      if (theme === "system") applyTheme();
    });

  const loadStylesheet = (href) => {
    if (loaded[href]) return loaded[href];
    loading[href] ??= new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = () => {
        loaded[href] = Promise.resolve();
        resolve();
      };
      link.onerror = () =>
        reject(new Error(`Failed to load stylesheet: ${href}`));
      document.head.appendChild(link);
    });
    return loading[href];
  };

  const loadScript = (src, options = {}) => {
    if (loaded[src]) return loaded[src];
    loading[src] ??= new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      if (options.crossOrigin) script.crossOrigin = options.crossOrigin;
      script.onload = () => {
        loaded[src] = Promise.resolve();
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
    return loading[src];
  };

  const applyTailwindConfig = () => {
    window.tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: THEME_COLORS,
          borderRadius: {
            lg: "var(--radius)",
            md: "calc(var(--radius) - 2px)",
            sm: "calc(var(--radius) - 4px)",
          },
        },
      },
    };
  };

  const createIcons = (options = {}) => {
    if (typeof window.lucide?.createIcons !== "function") return;
    window.lucide.createIcons(options);
  };

  const refreshIcons = () => {
    createIcons();
    requestAnimationFrame(() => createIcons());
  };

  const toLucideIconKey = (rawName) => {
    const name = String(rawName ?? "").trim();
    if (!name) return "";
    // lucide's `icons` map uses PascalCase keys (e.g. "Sparkles", "GitBranch")
    // while our public API / markup uses kebab-case (e.g. "sparkles", "git-branch").
    if (name.includes("-")) {
      return name
        .split("-")
        .filter(Boolean)
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join("");
    }
    return name[0].toUpperCase() + name.slice(1);
  };

  const paintLucideIcon = (host, name, className = "") => {
    if (!host) return;
    host.replaceChildren();
    const lib = window.lucide;
    const key = toLucideIconKey(name);
    const icon = lib?.icons?.[key] ?? lib?.icons?.[name];
    if (!lib?.createElement || !icon) return;
    const svg = lib.createElement(icon);
    if (className) svg.setAttribute("class", className);
    host.appendChild(svg);
  };

  let LucideIconComponent = null;

  const defineLucideIcon = () => {
    if (LucideIconComponent || !window.React) return LucideIconComponent;

    const { useRef, useEffect, createElement } = window.React;

    LucideIconComponent = function LucideIcon({ name, className = "" }) {
      const ref = useRef(null);
      useEffect(() => {
        paintLucideIcon(ref.current, name, className);
      }, [name, className]);
      return createElement("span", {
        ref,
        className: "inline-flex shrink-0",
        "aria-hidden": true,
      });
    };

    return LucideIconComponent;
  };

  const runBabelScripts = () => {
    if (!window.Babel) return;

    if (typeof window.Babel.transformScriptTags === "function") {
      window.Babel.transformScriptTags();
      return;
    }

    document.querySelectorAll('script[type="text/babel"]').forEach((script) => {
      const source = script.textContent || "";
      const compiled = window.Babel.transform(source, {
        presets: ["react"],
      }).code;
      const runner = document.createElement("script");
      runner.text = compiled;
      document.body.appendChild(runner);
      script.remove();
    });
  };

  const depLoaders = {
    css: () => loadStylesheet(CSS_PATH),
    tailwind: () => loadScript(CDN.tailwind).then(applyTailwindConfig),
    react: () =>
      loadScript(CDN.react, { crossOrigin: "anonymous" }).then(() =>
        loadScript(CDN["react-dom"], { crossOrigin: "anonymous" }),
      ),
    babel: () => loadScript(CDN.babel),
    zod: () => loadScript(CDN.zod),
    echarts: () => loadScript(CDN.echarts),
    hljs: () =>
      loadStylesheet(CDN["hljs-css"])
        .then(() => loadScript(CDN.hljs))
        .then(() => loadScript(CDN["hljs-json"])),
    lucide: () => loadScript(CDN.lucide),
  };

  const normalizeDeps = (deps) => {
    const list = [];
    const seen = Object.create(null);
    (deps || []).forEach((dep) => {
      const name = String(dep).trim();
      if (!name || seen[name]) return;
      seen[name] = true;
      list.push(name);
    });
    if (!seen.css) list.unshift("css");
    // Babel compiles <script type="text/babel"> — load it after Zod, Lucide, etc.
    const babelIndex = list.indexOf("babel");
    if (babelIndex !== -1) {
      list.splice(babelIndex, 1);
      list.push("babel");
    }
    return list;
  };

  const loadDep = (name) => {
    const loader = depLoaders[name];
    if (!loader) {
      return Promise.reject(new Error(`Unknown jarvis dependency: ${name}`));
    }
    return loader();
  };

  const writeTimers = Object.create(null);
  const writePending = Object.create(null);

  const performWrite = (path, content) =>
    fetch("/jarvis/file-write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, content }),
    }).then((res) =>
      res.json().then((data) => {
        if (!res.ok || data.ok === false || data.success === false) {
          throw new Error(data.error || "Failed to write file");
        }
        return data;
      }),
    );

  const flushWrite = async (path) => {
    const pending = writePending[path];
    if (!pending) return Promise.resolve();

    clearTimeout(writeTimers[path]);
    delete writeTimers[path];
    delete writePending[path];

    try {
      const result = await performWrite(path, pending.content);
      pending.resolvers.forEach((entry) => {
        entry.resolve(result);
      });
      return result;
    } catch (error) {
      pending.resolvers.forEach((entry) => {
        entry.reject(error);
      });
      throw error;
    }
  };

  const read = (path, options = {}) =>
    fetch(`/jarvis/file?path=${encodeURIComponent(path)}`).then((res) => {
      if (res.status === 404) {
        if ("default" in options) {
          if (options.as === "json") {
            if (typeof options.default === "string") {
              return JSON.parse(options.default);
            }
            return options.default;
          }
          return options.default;
        }
        throw new Error(`File not found: ${path}`);
      }
      if (!res.ok) {
        return res.text().then((body) => {
          throw new Error(body || "Failed to read file");
        });
      }
      return res.text().then((text) => {
        if (options.as === "json") return JSON.parse(text);
        return text;
      });
    });

  const writeTextFile = (path, content, options = {}) => {
    const debounce =
      options.debounce === undefined
        ? DEFAULT_WRITE_DEBOUNCE_MS
        : options.debounce;

    if (debounce === false || debounce === 0) {
      return performWrite(path, content);
    }

    return new Promise((resolve, reject) => {
      if (!writePending[path]) {
        writePending[path] = { content, resolvers: [] };
      } else {
        writePending[path].content = content;
      }
      writePending[path].resolvers.push({ resolve, reject });

      clearTimeout(writeTimers[path]);
      writeTimers[path] = setTimeout(() => {
        flushWrite(path);
      }, debounce);
    });
  };

  const navigate = (path) => {
    const trimmed = String(path ?? "").trim();
    if (!trimmed) {
      return Promise.reject(new Error("Navigation path is required"));
    }
    if (window.parent === window) {
      return Promise.reject(
        new Error(
          "jarvis.navigate() only works inside the Jarvis whiteboard iframe",
        ),
      );
    }
    window.parent.postMessage(
      { type: WHITEBOARD_NAVIGATE_MESSAGE_TYPE, path: trimmed },
      window.location.origin,
    );
    return Promise.resolve({ path: trimmed });
  };

  const init = (options = {}) => {
    if (readyPromise && !options.force) return readyPromise;

    markLoading();

    const deps = normalizeDeps(options.deps || []);
    readyPromise = deps
      .reduce((chain, dep) => chain.then(() => loadDep(dep)), Promise.resolve())
      .then(() => {
        defineLucideIcon();
        if (options.runBabel !== false && window.Babel) {
          runBabelScripts();
        }
        if (deps.includes("lucide")) {
          refreshIcons();
        }
      })
      .finally(markReady);

    return readyPromise;
  };

  window.jarvis = {
    CDN,
    lucideStaticBase: "https://unpkg.com/lucide-static@1.17.0/icons",
    deps: Object.keys(depLoaders),
    theme: {
      tokens: THEME_COLOR_TOKENS,
      colors: THEME_COLORS,
      tailwind: {
        background: ["bg-background", "text-background"],
        foreground: ["text-foreground"],
        card: ["bg-card", "text-card", "text-card-foreground"],
        primary: ["bg-primary", "text-primary", "text-primary-foreground"],
        secondary: [
          "bg-secondary",
          "text-secondary",
          "text-secondary-foreground",
        ],
        muted: ["bg-muted", "text-muted", "text-muted-foreground"],
        accent: ["bg-accent", "text-accent", "text-accent-foreground"],
        destructive: [
          "bg-destructive",
          "text-destructive",
          "border-destructive",
        ],
        border: ["border-border"],
        input: ["border-input", "bg-input"],
        ring: ["ring-ring", "focus:ring-ring"],
      },
      radius: ["rounded-sm", "rounded-md", "rounded-lg"],
    },
    init,
    ready: init,
    createIcons,
    refreshIcons,
    get LucideIcon() {
      return defineLucideIcon();
    },
    navigate,
    read,
    writeTextFile,
    flushWrite,
  };

  const bootstrap = document.currentScript;
  if (bootstrap?.dataset.jarvisDeps != null) {
    markLoading();

    const autoDeps = bootstrap.dataset.jarvisDeps
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const start = () => {
      init({ deps: autoDeps }).catch((error) => {
        console.error("[jarvis]", error);
      });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
  }
})();
