import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { CreateUserForm } from "@/components/CreateUserForm";

export default async function CreateTeacherPage() {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    return redirect("/");
  }

  if (session.user.role !== Role.Admin) {
    return redirect("/");
  }

  return <CreateUserForm backTo="/administradores" roleType={Role.Admin} />;
}
