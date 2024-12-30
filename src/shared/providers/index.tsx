"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Provider as ReactWrapBalancerProvider } from "react-wrap-balancer";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ReactWrapBalancerProvider>{children}</ReactWrapBalancerProvider>

        <Toaster />
      </ThemeProvider>
    </NextAuthSessionProvider>
  );
}
