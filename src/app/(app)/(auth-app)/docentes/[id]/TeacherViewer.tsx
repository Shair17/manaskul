"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import type { User } from "@prisma/client";

interface Props {
  teacher: User;
}

export const TeacherViewer: React.FC<Props> = ({ teacher }) => {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Ver Docente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-center">
              <img
                src={teacher.image ?? "/avatar.jpg"}
                alt="Avatar Preview"
                className="size-32 cursor-pointer rounded-full border border-neutral-200 bg-neutral-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre(s) y Apellidos</Label>
            <p className="text-lg">{teacher.name}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>

            <p className="text-lg">{teacher.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
