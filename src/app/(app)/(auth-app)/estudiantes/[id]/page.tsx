import { api } from "@/trpc/server";
import { StudentViewer } from "./StudentViewer";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";

interface Props {
  params: { id: string };
}

export default async function StudentPage(props: Props) {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    redirect("/estudiantes");
  }

  const studentId = props.params.id;

  const student = await api.student
    .getStudentById({ id: studentId })
    .catch(() => redirect("/estudiantes"));

  return <StudentViewer student={student} />;
}
