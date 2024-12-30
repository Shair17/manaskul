import { Suspense } from "react";
import { api } from "@/trpc/server";
import { SearchFilter } from "@/components/SearchFilter";
import { GridProgramsSkeleton } from "../programas/GridProgramsSkeleton";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminCard } from "./AdminCard";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { Role } from "@prisma/client";
import Link from "next/link";

interface Props {
  searchParams: { search?: string };
}

export default async function AdminsPage({ searchParams }: Props) {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    redirect("/");
  }

  if (session.user.role !== Role.Admin) {
    redirect("/");
  }

  const admins = await api.admin.getAllAdmins({
    search: searchParams.search,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Administradores</h1>

        <Button asChild>
          <Link href="/administradores/crear">Crear Administrador</Link>
        </Button>
      </div>

      <div className="mb-6 max-w-2xl">
        <SearchFilter
          queryKey="search"
          searchLabel="Buscar Administradoress"
          searchPlaceholder="Buscar administradores..."
        />
      </div>

      <Suspense key={searchParams.search} fallback={<GridProgramsSkeleton />}>
        {admins.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {admins.map((admin) => (
              <AdminCard key={admin.id} admin={admin} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center justify-center">
            <AlertTriangle
              className="mb-2 h-16 w-16 text-gray-400"
              name="exclamation-circle"
            />
            <p className="text-lg text-gray-500">
              No hay administradores registrados.{" "}
              <Link href="/administradores/crear" className="text-primary">
                Crear administrador
              </Link>
              .
            </p>
          </div>
        )}
      </Suspense>
    </div>
  );
}
