import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { Role } from "@prisma/client";
import { RegisterGradesForm } from "./RegisterGradesForm";

export default async function RegistrarNotasPage() {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    redirect("/notas");
  }

  const isStudent = session.user.role === Role.Student;

  if (isStudent) {
    redirect("/notas");
  }

  return <RegisterGradesForm />;
}
