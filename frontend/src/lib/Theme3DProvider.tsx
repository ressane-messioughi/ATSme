import type { ReactNode } from "react";
import { Theme3DContext, useTheme3DState, type Theme3DId } from "./theme3d.ts";

export function Theme3DProvider({ initialTheme, children }: { initialTheme: Theme3DId; children: ReactNode }) {
  const value = useTheme3DState(initialTheme);
  return <Theme3DContext.Provider value={value}>{children}</Theme3DContext.Provider>;
}
