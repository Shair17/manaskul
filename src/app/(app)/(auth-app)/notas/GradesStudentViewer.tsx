import { SearchFilter } from "@/components/SearchFilter";
import { GradesStudentDataTable } from "./GradesStudentDataTable";
import { api } from "@/trpc/server";
import { Role } from "@prisma/client";
import type { Session } from "next-auth";

interface Props {
  session: Session;

  searchParams: {
    search?: string;
  };
}

export const GradesStudentViewer: React.FC<Props> = async ({
  searchParams,
  session,
}) => {
  const isStudent = session.user.role === Role.Student;

  let enrollmets = await api.enrollment.getAllEnrollmentsByStudent({
    search: searchParams.search,
  });

  if (isStudent) {
    enrollmets = enrollmets.filter(
      (enrollmet) => enrollmet.student.id === session.user.id,
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mis Notas</h1>
      </div>

      <div className="mb-6 max-w-2xl">
        <SearchFilter
          queryKey="search"
          searchLabel="Buscar Notas"
          searchPlaceholder="Buscar por curso, programa, docente..."
        />
      </div>

      <GradesStudentDataTable data={enrollmets} />
    </div>
  );
};
