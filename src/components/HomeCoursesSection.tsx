import { Skeleton } from "./ui/skeleton";

import { api } from "@/trpc/react";
import { Role } from "@prisma/client";
import { cn, generateArray } from "@/lib/utils";

import Link from "next/link";
import { parseCourseMode } from "@/lib/parser";

import type { Session } from "next-auth";

interface Props {
  session: Session;
}

export const HomeCoursesSection: React.FC<Props> = ({ session }) => {
  const isAdmin = session.user.role === Role.Admin;

  const coursesQuery = api.course.getCourses.useQuery({
    quantity: 7,
  });

  return (
    <section>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">
          {isAdmin ? "Cursos" : "Mis Cursos"}
        </h3>
        <p className="text-sm text-muted-foreground">
          Se muestran hasta 7 cursos.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isAdmin ? (
          <Link
            href="/cursos/crear"
            className="flex h-[174px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 text-center hover:border-gray-400 focus:outline-none"
          >
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Agregar curso
            </span>
          </Link>
        ) : null}

        {coursesQuery.isLoading
          ? generateArray(3).map((key) => (
              <Skeleton key={key} className="h-[174px] w-full" />
            ))
          : null}

        {coursesQuery.data?.map((course) => {
          return (
            <div
              key={course.id}
              className="flex flex-col justify-between rounded-lg border bg-white p-6 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {course.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    Créditos: {course.credits}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    Cantidad de horas: {course.hours}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    Programa: {course.program.name}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    Docente: {course.teacher.name}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    "bg-green-50 text-green-700",
                  )}
                >
                  {parseCourseMode(course.mode)}
                </span>
                <Link
                  href={`/cursos/${course.id}`}
                  className="text-sm text-gray-500 underline hover:text-gray-700"
                >
                  Ver detalles
                </Link>
              </div>
            </div>
          );
        })}

        {!coursesQuery.isLoading && coursesQuery.data?.length === 0 ? (
          <div className="flex h-[174px] flex-col items-center justify-center rounded-lg border bg-white p-6 shadow-sm">
            <p>No hay cursos.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
};
