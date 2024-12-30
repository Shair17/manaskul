import { api } from "@/trpc/server";
import { TeacherViewer } from "./TeacherViewer";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";

interface Props {
  params: { id: string };
}

export default async function StudentPage(props: Props) {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    return redirect("/docentes");
  }

  const teacherId = props.params.id;

  const teacher = await api.teacher
    .getTeacherById({ id: teacherId })
    .catch(() => redirect("/docentes"));

  return <TeacherViewer teacher={teacher} />;
}
