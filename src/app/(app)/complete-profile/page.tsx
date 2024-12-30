import { CompleteProfileForm } from "@/components/CompleteProfileForm";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function CompleteProfilePage() {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    redirect("/");
  }

  const hasCompletedProfile = !!session?.user.name && !!session?.user.image;

  if (hasCompletedProfile) {
    redirect("/");
  }

  return <CompleteProfileForm session={session} />;
}
