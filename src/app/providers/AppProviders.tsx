import type { ReactNode } from "react";
import { AuthProvider } from "@/core/context/AuthContext.tsx";
import { ThemeProvider } from "@/core/context/ThemeContext.tsx";
import { LanguageProvider } from "@/core/context/LanguageContext.tsx";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>{children}</AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
