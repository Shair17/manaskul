import { Suspense } from "react";
import { AlertTriangle } from "lucide-react";
import { GridCoursesSkeleton } from "./GridCoursesSkeleton";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Role } from "@prisma/client";
import { SearchFilter } from "@/components/SearchFilter";
import { CourseCard } from "./CourseCard";

interface Props {
  searchParams: { search?: string };
}

export default async function CoursesPage({ searchParams }: Props) {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;
  const isAdmin = session?.user.role === Role.Admin;

  if (!isAuthenticated) {
    return redirect("/");
  }

  const courses = await api.course.getAllCourses({
    search: searchParams.search,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isAdmin ? "Cursos" : "Mis Cursos"}
        </h1>

        {isAdmin ? (
          <Button asChild>
            <Link href="/cursos/crear">Crear curso</Link>
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

      <Suspense key={searchParams.search} fallback={<GridCoursesSkeleton />}>
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
              No hay cursos registrados.{" "}
              {isAdmin ? (
                <>
                  <Link href="/cursos/crear" className="text-primary">
                    Crear curso
                  </Link>
                  .
                </>
              ) : null}
            </p>
          </div>
        )}
      </Suspense>
    </div>
  );
}
