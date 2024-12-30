import { api } from "@/trpc/server";
import { EditStudentForm } from "./EditStudentForm";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { Role } from "@prisma/client";

interface Props {
  params: { id: string };
}

export default async function EditStudentPage(props: Props) {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    redirect("/estudiantes");
  }

  if (session.user.role !== Role.Admin) {
    redirect("/estudiantes");
  }

  const studentId = props.params.id;

  const student = await api.student
    .getStudentById({ id: studentId })
    .catch(() => redirect("/estudiantes"));

  return <EditStudentForm student={student} />;
}
