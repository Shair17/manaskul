"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PencilIcon, TrashIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Course, Enrollment, Program, User } from "@prisma/client";
import { parseCourseMode, parseSizeToText } from "@/lib/parser";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface Props {
  course: Course & {
    enrollments: Enrollment[];
    program: Program;
    teacher: User;
  };
  isAdmin?: boolean;
}

export const CourseCard: React.FC<Props> = ({ course, isAdmin = false }) => {
  const router = useRouter();

  const deleteCourseMutation = api.course.deleteCourse.useMutation({
    onError(error) {
      toast.error(error.message);
    },
  });

  const onDeleteCourse = async () => {
    if (!isAdmin) return;

    await deleteCourseMutation.mutateAsync({
      id: course.id,
    });

    router.refresh();
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">
              <Link href={`/cursos/${course.id}`} className="underline">
                {course.name}
              </Link>
            </CardTitle>
            <CardDescription>
              Programa:{" "}
              <Link
                href={`/programas/${course.program.id}`}
                className="font-bold underline"
              >
                {course.program.name}
              </Link>
            </CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {parseCourseMode(course.mode)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative h-10 w-10">
              <img
                src={course.teacher.image ?? "/avatar.jpg"}
                alt={course.teacher.name ?? "Teacher"}
                className="rounded-full"
              />
            </div>
            <div>
              <p className="text-sm font-medium">Profesor</p>
              <p className="text-sm text-muted-foreground">
                {course.teacher.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Créditos</p>
              <p className="text-sm text-muted-foreground">{course.credits}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Horas</p>
              <p className="text-sm text-muted-foreground">{course.hours}</p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="w-full">
          <p className="text-sm text-muted-foreground">
            {course.enrollments.length}{" "}
            {parseSizeToText(
              course.enrollments.length,
              "estudiante",
              "estudiantes",
            )}{" "}
            {parseSizeToText(
              course.enrollments.length,
              "inscrito",
              "inscritos",
            )}
          </p>
        </div>

        {isAdmin ? (
          <div className="flex flex-col justify-between gap-2 md:flex-row">
            <Button asChild className="w-full gap-2">
              <Link href={`/cursos/${course.id}/editar`}>
                <PencilIcon className="size-4" />
                Editar
              </Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <TrashIcon className="size-4" />
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Estás seguro de querer eliminar el curso {course.name}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará todos los registros del alumno y no es
                    reversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={deleteCourseMutation.isPending}
                    onClick={onDeleteCourse}
                  >
                    Sí, eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : null}
      </CardFooter>
    </Card>
  );
};
