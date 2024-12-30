import { Suspense } from "react";
import { api } from "@/trpc/server";
import { SearchFilter } from "@/components/SearchFilter";
import { GridProgramsSkeleton } from "../programas/GridProgramsSkeleton";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { StudentCard } from "./StudentCard";
import { Button } from "@/components/ui/button";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

interface Props {
  searchParams: { search?: string };
}

export default async function StudentsPage({ searchParams }: Props) {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  const isAdmin = session?.user.role === Role.Admin;

  if (!isAuthenticated) {
    redirect("/");
  }

  if (session.user.role === Role.Student) {
    redirect("/");
  }

  const students = await api.student
    .getAllStudents({
      search: searchParams.search,
    })
    .catch(() => redirect("/"));

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isAdmin ? "Estudiantes" : "Mis Estudiantes"}
        </h1>

        {isAdmin ? (
          <Button asChild>
            <Link href="/estudiantes/crear">Crear estudiante</Link>
          </Button>
        ) : null}
      </div>

      <div className="mb-6 max-w-2xl">
        <SearchFilter
          queryKey="search"
          searchLabel="Buscar Estudiantes"
          searchPlaceholder="Buscar estudiantes..."
        />
      </div>

      <Suspense key={searchParams.search} fallback={<GridProgramsSkeleton />}>
        {students.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center justify-center">
            <AlertTriangle
              className="mb-2 h-16 w-16 text-gray-400"
              name="exclamation-circle"
            />
            <p className="text-lg text-gray-500">
              No hay estudiantes registrados.{" "}
              {isAdmin ? (
                <>
                  <Link href="/estudiantes/crear" className="text-primary">
                    Crear estudiante
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
