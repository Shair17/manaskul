import { getServerAuthSession } from "@/server/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { CreateCourseForm } from "./CreateCourseForm";
import { api } from "@/trpc/server";

interface Props {
  searchParams: { programId?: string; teacherId: string; mode?: string };
}

export default async function CreateCoursePage({ searchParams }: Props) {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    redirect("/");
  }

  if (session.user.role !== Role.Admin) {
    redirect("/");
  }

  const programs = await api.program.getAllPrograms({});
  const teachers = await api.teacher.getAllTeachers({});

  return (
    <CreateCourseForm
      mode={searchParams.mode}
      programId={searchParams.programId}
      teacherId={searchParams.teacherId}
      programs={programs}
      teachers={teachers}
    />
  );
}
