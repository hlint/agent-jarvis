import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useCssVariable(name: string, fallback: string) {
  const { resolvedTheme } = useTheme();
  const [value, setValue] = useState(fallback);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-read CSS variables when theme changes
  useEffect(() => {
    const cssValue = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    setValue(cssValue || fallback);
  }, [fallback, name, resolvedTheme]);

  return value;
}
