"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Role,
  type Course,
  type Enrollment,
  type User,
  type Program,
} from "@prisma/client";
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
import type { Session } from "next-auth";
import {
  PencilIcon,
  TrashIcon,
  UserIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { parseCourseMode } from "@/lib/parser";

interface Props {
  course: Course & {
    enrollments: (Enrollment & { student?: User })[];
    program: Program;
    teacher: User;
  };
  session: Session;
}

export const CourseViewer: React.FC<Props> = ({ course, session }) => {
  const router = useRouter();

  const isAdmin = session.user.role === Role.Admin;

  const deleteCourseMutation = api.course.deleteCourse.useMutation({
    onError(error) {
      toast.error(error.message);
    },
  });

  const deleteStudentFromCourse = api.course.removeStudent.useMutation({
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

  const onDeleteStudentFromCourse = async (studentId: string) => {
    if (!isAdmin || !studentId) return;

    await deleteStudentFromCourse.mutateAsync({
      courseId: course.id,
      studentId: studentId,
    });

    router.refresh();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{course.name}</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Programa:</span>
              <Link
                href={`/programas/${course.program.id}`}
                className="text-primary hover:underline"
              >
                {course.program.name}
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">Docente:</span>
              <Link
                href={`/docentes/${course.teacher.id}`}
                className="text-primary hover:underline"
              >
                {course.teacher.name}
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">Modalidad:</span>
              <span>{parseCourseMode(course.mode)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Créditos:</span>
              <span>{course.credits}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">Horas:</span>
              <span>{course.hours}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">Estudiantes matriculados:</span>
              <span>{course.enrollments.length}</span>
            </div>
          </div>
        </div>

        {isAdmin ? (
          <div className="mt-2 flex flex-col justify-between gap-2 md:flex-row">
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
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Estudiantes del Curso</h2>
          {isAdmin && (
            <Button asChild>
              <Link href={`/cursos/${course.id}/estudiantes/agregar`}>
                <UserPlusIcon className="mr-2 size-4" />
                Agregar Estudiante
              </Link>
            </Button>
          )}
        </div>

        {course.enrollments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {course.enrollments.map((enrollment) => (
              <Card
                key={enrollment.id}
                className="flex flex-col justify-between"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={enrollment.student?.image ?? "/avatar.jpg"}
                        alt={enrollment.student?.name ?? "Estudiante"}
                      />
                      <AvatarFallback>
                        {enrollment.student?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {enrollment.student?.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.student?.email}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                {isAdmin && (
                  <CardFooter>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                        >
                          <UserMinusIcon className="mr-2 size-4" />
                          Eliminar del curso
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            ¿Eliminar a {enrollment.student?.name} del curso?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará al estudiante del curso. El
                            estudiante perderá acceso a todo el contenido del
                            curso.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              onDeleteStudentFromCourse(
                                enrollment.student?.id!,
                              );
                            }}
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <UserIcon className="mb-2 size-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-semibold">
                No hay estudiantes matriculados
              </p>
              <p className="text-sm text-muted-foreground">
                {isAdmin
                  ? "Agrega estudiantes al curso usando el botón superior."
                  : "Este curso aún no tiene estudiantes matriculados."}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
