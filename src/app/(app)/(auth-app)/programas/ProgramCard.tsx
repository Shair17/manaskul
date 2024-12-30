"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PencilIcon, TrashIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Course, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { toast } from "sonner";

import type { Program } from "@prisma/client";
import { parseSizeToText } from "@/lib/parser";

interface Props {
  program: Program & { courses: Course[] };
}

export const ProgramCard: React.FC<Props> = ({ program }) => {
  const router = useRouter();

  const deleteProgramMutation = api.program.deleteProgram.useMutation({
    onError(error) {
      toast.error(error.message);
    },
  });

  const onDeleteProgram = async () => {
    await deleteProgramMutation.mutateAsync({
      id: program.id,
    });

    router.refresh();
  };

  return (
    <Card className="shadow-md transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle>
          <Link href={`/programas/${program.id}`}>{program.name}</Link>
        </CardTitle>
        <CardDescription>
          {program.courses.length}{" "}
          {parseSizeToText(program.courses.length, "curso", "cursos")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={`/programas/${program.id}`}
          className="text-sm text-gray-500 underline hover:text-gray-700"
        >
          Ver detalles
        </Link>
      </CardContent>
      <CardFooter className="flex flex-col justify-between gap-2 md:flex-row">
        <Button asChild className="w-full gap-2">
          <Link href={`/programas/${program.id}/editar`}>
            <PencilIcon className="size-4" />
            Editar
          </Link>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full gap-2">
              <TrashIcon className="size-4" />
              Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Estás seguro de querer eliminar al programa {program.name}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará todos los registros del alumno y no es
                reversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleteProgramMutation.isPending}
                onClick={onDeleteProgram}
              >
                Sí, eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};
