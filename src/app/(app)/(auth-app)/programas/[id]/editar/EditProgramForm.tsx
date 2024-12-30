"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Course, Program } from "@prisma/client";

interface Props {
  program: Program & { courses: Course[] };
}

export const EditProgramForm: React.FC<Props> = ({ program }) => {
  const router = useRouter();
  const [name, setName] = useState(program.name ?? "");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const editProgram = api.program.editProgram.useMutation({
    onError(error) {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      if (!name) {
        toast.error("Por favor completa los datos!");
        return;
      }

      await editProgram.mutateAsync({
        name: name.trim(),
        id: program.id,
      });

      toast.success("Programa editado exitosamente");
      router.push("/programas");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Crear Nuevo Programa</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del programa"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={editProgram.isPending || isLoading}
          >
            {editProgram.isPending || isLoading
              ? "Creando..."
              : "Guardar Cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
