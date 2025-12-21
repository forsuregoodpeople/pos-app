"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="nota-app-theme"
      enableColorScheme
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}