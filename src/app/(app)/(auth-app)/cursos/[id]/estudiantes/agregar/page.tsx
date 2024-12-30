import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { AddStudentForm } from "./AddStudentForm";

interface Props {
  params: { id: string };
}

export default async function AddStudentToCoursePage({ params }: Props) {
  const course = await api.course
    .getCourseById({ id: params.id })
    .catch(() => redirect("/cursos"));

  return <AddStudentForm course={course} />;
}
