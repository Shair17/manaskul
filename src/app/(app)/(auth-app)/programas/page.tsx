import { Suspense } from "react";

import { AlertTriangle } from "lucide-react";
import { GridProgramsSkeleton } from "./GridProgramsSkeleton";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Role } from "@prisma/client";
import { SearchFilter } from "@/components/SearchFilter";
import { ProgramCard } from "./ProgramCard";
import Link from "next/link";

interface Props {
  searchParams: { search?: string };
}

export default async function ProgramasPage({ searchParams }: Props) {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;
  const isAdmin = session?.user.role === Role.Admin;

  if (!isAuthenticated) {
    redirect("/");
  }

  const programs = await api.program.getAllPrograms({
    search: searchParams.search,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Programas</h1>

        {isAdmin ? (
          <Button asChild>
            <Link href="/programas/crear">Crear programa</Link>
          </Button>
        ) : null}
      </div>

      <div className="mb-6 max-w-2xl">
        <SearchFilter
          queryKey="search"
          searchLabel="Buscar Programas"
          searchPlaceholder="Buscar programas..."
        />
      </div>

      <Suspense key={searchParams.search} fallback={<GridProgramsSkeleton />}>
        {programs.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center justify-center">
            <AlertTriangle
              className="mb-2 h-16 w-16 text-gray-400"
              name="exclamation-circle"
            />
            <p className="text-lg text-gray-500">
              No hay programas registrados.{" "}
              {isAdmin ? (
                <Link href="/programas/crear" className="text-primary">
                  Crear programa
                </Link>
              ) : null}
              .
            </p>
          </div>
        )}
      </Suspense>
    </div>
  );
}
