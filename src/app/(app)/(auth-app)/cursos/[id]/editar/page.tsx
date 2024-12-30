import { getServerAuthSession } from "@/server/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { EditCourseForm } from "./EditCourseForm";
import { api } from "@/trpc/server";

interface Props {
  params: { id: string };
}

export default async function EditCoursePage({ params }: Props) {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    return redirect("/");
  }

  if (session.user.role !== Role.Admin) {
    return redirect("/");
  }

  const courseId = params.id;

  const course = await api.course
    .getCourseById({ id: courseId })
    .catch(() => redirect("/cursos"));

  return <EditCourseForm course={course} />;
}
