import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { Fragment } from "react";

export default async function AppAuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    redirect("/auth");
  }

  return <Fragment>{children}</Fragment>;
}
