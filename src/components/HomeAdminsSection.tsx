import { Skeleton } from "./ui/skeleton";

import { api } from "@/trpc/react";
import { Role } from "@prisma/client";
import { cn, generateArray } from "@/lib/utils";

import type { Session } from "next-auth";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface Props {
  session: Session;
}

export const HomeAdminsSection: React.FC<Props> = ({ session }) => {
  const isAdmin = session.user.role === Role.Admin;

  const adminsQuery = api.admin.getAdmins.useQuery({
    quantity: 7,
  });

  if (!isAdmin) {
    return null;
  }

  return (
    <section className="flex flex-col">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Administradores</h3>
        <p className="text-sm text-muted-foreground">
          Se muestran hasta 7 administradores.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Link
          href="/administradores/crear"
          className="flex h-[130px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 text-center hover:border-gray-400 focus:outline-none"
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
            Agregar administrador
          </span>
        </Link>

        {adminsQuery.isLoading
          ? generateArray(3).map((key) => (
              <Skeleton key={key} className="h-[130px] w-full" />
            ))
          : null}

        {adminsQuery.data?.map((admin) => {
          return (
            <div
              key={admin.id}
              className="flex flex-col justify-between rounded-lg border bg-white p-6 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={admin.image ?? undefined}
                    alt={`@${admin.name ?? admin.email}`}
                  />
                  <AvatarFallback>{admin.name}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {admin.name}
                  </p>
                  <p className="truncate text-sm text-gray-500">
                    {admin.email}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    "bg-neutral-50 text-neutral-700",
                  )}
                >
                  Administrador
                </span>
                <Link
                  href={`/administradores/${admin.id}`}
                  className="text-sm text-gray-500 underline hover:text-gray-700"
                >
                  Ver detalles
                </Link>
              </div>
            </div>
          );
        })}

        {!adminsQuery.isLoading && adminsQuery.data?.length === 0 ? (
          <div className="flex h-[174px] flex-col items-center justify-center rounded-lg border bg-white p-6 shadow-sm">
            <p>No hay administradores.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
};
