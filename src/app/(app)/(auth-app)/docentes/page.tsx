import { Suspense } from "react";
import { api } from "@/trpc/server";
import { SearchFilter } from "@/components/SearchFilter";
import { GridProgramsSkeleton } from "../programas/GridProgramsSkeleton";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeacherCard } from "./TeacherCard";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { Role } from "@prisma/client";
import Link from "next/link";

interface Props {
  searchParams: { search?: string };
}

export default async function TeachersPage({ searchParams }: Props) {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    redirect("/");
  }

  if (session.user.role !== Role.Admin) {
    redirect("/");
  }

  const teachers = await api.teacher.getAllTeachers({
    search: searchParams.search,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Docentes</h1>

        <Button asChild>
          <Link href="/docentes/crear">Crear Docente</Link>
        </Button>
      </div>

      <div className="mb-6 max-w-2xl">
        <SearchFilter
          queryKey="search"
          searchLabel="Buscar Docentes"
          searchPlaceholder="Buscar docentes..."
        />
      </div>

      <Suspense key={searchParams.search} fallback={<GridProgramsSkeleton />}>
        {teachers.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center justify-center">
            <AlertTriangle
              className="mb-2 h-16 w-16 text-gray-400"
              name="exclamation-circle"
            />
            <p className="text-lg text-gray-500">
              No hay docentes registrados.{" "}
              <Link href="/docentes/crear" className="text-primary">
                Crear docente
              </Link>
              .
            </p>
          </div>
        )}
      </Suspense>
    </div>
  );
}
