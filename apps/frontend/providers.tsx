// filepath: apps/frontend/providers.tsx

"use client";

import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/layout/sidebar-context"; // ✅ Import SidebarProvider

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // ✅ SidebarProvider wraps ThemeProvider so both contexts are available
    <SidebarProvider>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem 
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </SidebarProvider>
  );
}