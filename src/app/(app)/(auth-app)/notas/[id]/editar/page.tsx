import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { Role } from "@prisma/client";
import { api } from "@/trpc/server";
import { EditGradesForm } from "./EditGradesForm";

interface Props {
  params: { id: string };
  searchParams: {};
}

export default async function EditNotasPage(props: Props) {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    redirect("/notas");
  }

  const isStudent = session.user.role === Role.Student;

  if (isStudent) {
    redirect("/notas");
  }

  const enrollmentId = props.params.id;

  const enrollment = await api.enrollment
    .getById({ id: enrollmentId })
    .catch(() => redirect("/notas"));

  return <EditGradesForm enrollment={enrollment} />;
}
