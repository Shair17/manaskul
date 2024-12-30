import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { CourseViewer } from "./CourseViewer";

interface Props {
  params: { id: string };
}

export default async function CoursePage({ params }: Props) {
  const courseId = params.id;
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    return redirect("/programas");
  }

  const course = await api.course
    .getCourseById({ id: courseId })
    .catch(() => redirect("/cursos"));

  return <CourseViewer course={course} session={session} />;
}
