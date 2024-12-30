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
import type { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface Props {
  teacher: User;
}

export const TeacherCard: React.FC<Props> = ({ teacher }) => {
  const router = useRouter();
  const deleteTeacherMutation = api.teacher.deleteTeacher.useMutation({
    onError(error) {
      toast.error(error.message);
    },
  });

  const onDeleteTeacher = async () => {
    await deleteTeacherMutation.mutateAsync({
      id: teacher.id,
    });

    router.refresh();
  };

  return (
    <Card className="shadow-md transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle>
          <Link href={`/docentes/${teacher.id}`}>{teacher.name}</Link>
        </CardTitle>
        <CardDescription>{teacher.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <Avatar className="h-40 w-40">
            <AvatarImage
              src={teacher.image ?? "/avatar.jpg"}
              alt={teacher.name ?? "docente"}
            />
            <AvatarFallback>{teacher?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col justify-between gap-2 md:flex-row">
        <Button asChild className="w-full gap-2">
          <Link href={`/docentes/${teacher.id}/editar`}>
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
                Estás seguro de querer eliminar al alumno {teacher.name}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará todos los registros del alumno y no es
                reversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleteTeacherMutation.isPending}
                onClick={onDeleteTeacher}
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
