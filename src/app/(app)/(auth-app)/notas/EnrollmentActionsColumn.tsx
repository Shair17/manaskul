"use client";

import { api } from "@/trpc/react";
import { Enrollment } from "@prisma/client";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  enrollment: Enrollment;
  hasGrades: boolean;
  showEditAction?: boolean;
}

export const EnrollmentActionsColumn: React.FC<Props> = ({
  enrollment,
  hasGrades,
  showEditAction = false,
}) => {
  const isProduction = process.env.NODE_ENV === "production";

  const generateReportByEnrollmentMutation =
    api.report.generateReportByEnrollment.useMutation();

  const onDownloadRecord = async () => {
    if (!hasGrades) return;

    try {
      let response = await generateReportByEnrollmentMutation.mutateAsync({
        enrollmentId: enrollment.id,
      });

      toast.success("Reporte generado, se abrirá en una nueva ventana.");

      if (isProduction) {
        response.filePath = `/api/assets/${response.filePath}`;
      }

      window.open(response.filePath);
    } catch (error) {
      toast.error("Ocurrió un error al generar el reporte.");
    }
  };

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>

          {showEditAction ? (
            <>
              <DropdownMenuItem asChild>
                <Link href={`/notas/${enrollment.id}/editar`}>
                  Editar Notas
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
            </>
          ) : null}

          <DropdownMenuItem onClick={onDownloadRecord} disabled={!hasGrades}>
            Descargar Registro
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
