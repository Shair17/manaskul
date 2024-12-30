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
  admin: User;
}

export const AdminCard: React.FC<Props> = ({ admin }) => {
  const router = useRouter();

  const deleteAdminMutation = api.admin.deleteAdmin.useMutation({
    onError(error) {
      toast.error(error.message);
    },
  });

  const onDeleteAdmin = async () => {
    await deleteAdminMutation.mutateAsync({
      id: admin.id,
    });

    toast.success("Administrador eliminado exitosamente.");

    router.refresh();
  };

  return (
    <Card className="shadow-md transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle>
          <Link href={`/administradores/${admin.id}`}>{admin.name}</Link>
        </CardTitle>
        <CardDescription>{admin.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <Avatar className="h-40 w-40">
            <AvatarImage
              src={admin.image ?? "/avatar.jpg"}
              alt={admin.name ?? "administrador"}
            />
            <AvatarFallback>{admin?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col justify-between gap-2 md:flex-row">
        <Button asChild className="w-full gap-2">
          <Link href={`/administradores/${admin.id}/editar`}>
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
                Estás seguro de querer eliminar al administrador {admin.name}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará todos los registros del alumno y no es
                reversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleteAdminMutation.isPending}
                onClick={onDeleteAdmin}
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
