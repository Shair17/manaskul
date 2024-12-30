import { api } from "@/trpc/server";
import { EditTeacherForm } from "./EditTeacherForm";
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
    redirect("/docentes");
  }

  if (session.user.role !== Role.Admin) {
    redirect("/docentes");
  }

  const teacherId = props.params.id;

  const teacher = await api.teacher
    .getTeacherById({ id: teacherId })
    .catch(() => redirect("/docentes"));

  return <EditTeacherForm teacher={teacher} />;
}
