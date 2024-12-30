"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import type { Course, Enrollment, User } from "@prisma/client";

interface Props {
  student: User & { coursesTaken: (Enrollment & { course?: Course })[] };
}

export const StudentViewer: React.FC<Props> = ({ student }) => {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Ver Estudiante</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-center">
              <img
                src={student.image ?? "/avatar.jpg"}
                alt="Avatar Preview"
                className="size-32 cursor-pointer rounded-full border border-neutral-200 bg-neutral-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre(s) y Apellidos</Label>
            <p className="text-lg">{student.name}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>

            <p className="text-lg">{student.email}</p>
          </div>

          <div className="space-y-2">
            <Label>Cursos Matriculados</Label>
            {student.coursesTaken.length > 0 ? (
              <div className="space-y-2">
                {student.coursesTaken.map((enrollment) => (
                  <Card key={enrollment.id} className="p-4">
                    <CardTitle className="text-base">
                      {enrollment.course?.name}
                    </CardTitle>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                <strong>{student.name}</strong> no está matriculado en ningún
                curso.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
