import { useState, type ReactNode } from "react";
import { ThemeContext, persistTheme, type ThemeId } from "./theme.ts";

export function ThemeProvider({ initialTheme, children }: { initialTheme: ThemeId; children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(initialTheme);

  function setTheme(next: ThemeId) {
    persistTheme(next);
    setThemeState(next);
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
