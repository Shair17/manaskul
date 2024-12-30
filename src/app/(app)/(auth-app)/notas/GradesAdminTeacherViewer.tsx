import { SearchFilter } from "@/components/SearchFilter";
import { Button } from "@/components/ui/button";
import { GradesAdminDataTable } from "./GradesAdminDataTable";
import Link from "next/link";
import { api } from "@/trpc/server";
import type { Session } from "next-auth";
import { Role } from "@prisma/client";

interface Props {
  session: Session;

  searchParams: {
    search?: string;
  };
}

export const GradesAdminTeacherViewer: React.FC<Props> = async ({
  searchParams,
  session,
}) => {
  const isTeacher = session.user.role === Role.Instructor;

  let enrollmets = await api.enrollment.getAllEnrollments({
    search: searchParams.search,
  });

  if (isTeacher) {
    enrollmets = enrollmets.filter(
      (enrollmet) => enrollmet.course.teacher.id === session.user.id,
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notas</h1>

        <Button asChild>
          <Link href="/notas/registrar-notas">Registrar Nota</Link>
        </Button>
      </div>

      <div className="mb-6 max-w-2xl">
        <SearchFilter
          queryKey="search"
          searchLabel="Buscar Notas"
          searchPlaceholder="Buscar por curso, programa, docente, estudiante..."
        />
      </div>

      <GradesAdminDataTable data={enrollmets} />
    </div>
  );
};
