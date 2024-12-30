import { Fragment } from "react";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (isAuthenticated) {
    redirect("/");
  }

  return <Fragment>{children}</Fragment>;
}
