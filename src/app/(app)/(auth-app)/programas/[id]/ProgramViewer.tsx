import { SearchFilter } from "@/components/SearchFilter";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { GridProgramsSkeleton } from "../GridProgramsSkeleton";
import { Role, type Program } from "@prisma/client";
import { api } from "@/trpc/server";
import { AlertTriangle } from "lucide-react";
import { CourseCard } from "../../cursos/CourseCard";
import type { Session } from "next-auth";

interface Props {
  program: Program;
  session: Session;
  searchParams: { search?: string };
}

export const ProgramViewer: React.FC<Props> = async ({
  program,
  session,
  searchParams,
}) => {
  const isAdmin = session.user.role === Role.Admin;

  const courses = await api.course.getAllCourses({
    search: searchParams.search,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{program.name}</h1>

        {isAdmin ? (
          <Button asChild>
            <Link href={`/cursos/crear?programId=${program.id}`}>
              Agregar curso
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="mb-6 max-w-2xl">
        <SearchFilter
          queryKey="search"
          searchLabel="Buscar Cursos"
          searchPlaceholder="Buscar cursos..."
        />
      </div>

      <Suspense key={searchParams.search} fallback={<GridProgramsSkeleton />}>
        {courses.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} isAdmin={isAdmin} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center justify-center">
            <AlertTriangle
              className="mb-2 h-16 w-16 text-gray-400"
              name="exclamation-circle"
            />
            <p className="text-lg text-gray-500">
              No hay cursos en el programa <strong>{program.name}</strong>.{" "}
              {isAdmin ? (
                <Link
                  href={`/cursos/crear?programId=${program.id}`}
                  className="text-primary"
                >
                  Agregar curso
                </Link>
              ) : null}
              .
            </p>
          </div>
        )}
      </Suspense>
    </div>
  );
};
