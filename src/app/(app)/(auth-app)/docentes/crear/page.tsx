import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { CreateUserForm } from "@/components/CreateUserForm";

export default async function CreateTeacherPage() {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    redirect("/docentes");
  }

  if (session.user.role !== Role.Admin) {
    redirect("/docentes");
  }

  return <CreateUserForm backTo="/docentes" roleType={Role.Instructor} />;
}
