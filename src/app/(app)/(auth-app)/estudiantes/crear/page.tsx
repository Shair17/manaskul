import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { CreateUserForm } from "@/components/CreateUserForm";

export default async function CreateStudentPage() {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    redirect("/estudiantes");
  }

  if (session.user.role !== Role.Admin) {
    redirect("/estudiantes");
  }

  return <CreateUserForm backTo="/estudiantes" roleType={Role.Student} />;
}
