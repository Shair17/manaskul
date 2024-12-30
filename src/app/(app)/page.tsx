import { getServerAuthSession } from "@/server/auth";
import { AuthAdvice } from "@/components/AuthAdvice";
import { AuthHome } from "@/components/AuthHome";

export default async function AppHome() {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    return <AuthAdvice />;
  }

  return <AuthHome session={session} />;
}
