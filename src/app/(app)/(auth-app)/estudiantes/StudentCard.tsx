"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type { User } from "@prisma/client";

interface Props {
  student: User;
}

export const StudentCard: React.FC<Props> = ({ student }) => {
  const router = useRouter();
  const deleteStudentMutation = api.student.deleteStudent.useMutation({
    onError(error) {
      toast.error(error.message);
    },
  });

  const onDeleteStudent = async () => {
    await deleteStudentMutation.mutateAsync({
      id: student.id,
    });

    router.refresh();
  };

  return (
    <Card
      key={student.id}
      className="shadow-md transition-shadow hover:shadow-lg"
    >
      <CardHeader>
        <CardTitle>
          <Link href={`/estudiantes/${student.id}`}>{student.name}</Link>
        </CardTitle>
        <CardDescription>{student.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <Avatar className="h-40 w-40">
            <AvatarImage
              src={student.image ?? "/avatar.jpg"}
              alt={student.name ?? "estudiante"}
            />
            <AvatarFallback>{student?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col justify-between gap-2 md:flex-row">
        <Button asChild className="w-full gap-2">
          <Link href={`/estudiantes/${student.id}/editar`}>
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
                Estás seguro de querer eliminar al alumno {student.name}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará todos los registros del alumno y no es
                reversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleteStudentMutation.isPending}
                onClick={onDeleteStudent}
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
