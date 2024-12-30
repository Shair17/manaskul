import { Role } from "@prisma/client";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { GradesAdminTeacherViewer } from "./GradesAdminTeacherViewer";
import { GradesStudentViewer } from "./GradesStudentViewer";

interface Props {
  searchParams: {};
}

export default async function NotasPage({ searchParams }: Props) {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    redirect("/");
  }

  const isAdmin = session.user.role === Role.Admin;
  const isTeacher = session.user.role === Role.Instructor;

  if (isAdmin || isTeacher) {
    return (
      <GradesAdminTeacherViewer searchParams={searchParams} session={session} />
    );
  }

  return <GradesStudentViewer searchParams={searchParams} session={session} />;
}
