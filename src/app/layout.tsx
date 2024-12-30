import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import { HydrateClient } from "@/trpc/server";
import { Providers } from "@/shared/providers";
import { cn } from "@/lib/utils";
import { ProfileCompleteValidator } from "@/shared/providers/ProfileCompleteValidator";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sistema Académico",
  description: "Developed by @shair.dev",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={cn(inter.variable, "h-full font-sans")}
      suppressHydrationWarning
    >
      <body className="antialiased" suppressHydrationWarning>
        <TRPCReactProvider>
          <HydrateClient>
            <Providers>
              <div className="relative flex min-h-dvh flex-col">{children}</div>

              <ProfileCompleteValidator />
            </Providers>
          </HydrateClient>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
