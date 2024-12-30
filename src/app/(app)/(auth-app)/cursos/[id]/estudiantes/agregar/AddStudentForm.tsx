"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Course } from "@prisma/client";

interface Props {
  course: Course;
}

export const AddStudentForm: React.FC<Props> = ({ course }) => {
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  const studentsQuery = api.student.getAllStudents.useQuery({});

  const addStudentMutation = api.course.addStudent.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) {
      toast.error("Por favor selecciona un estudiante");
      return;
    }

    await addStudentMutation.mutateAsync({
      courseId: course.id,
      studentId: selectedStudent,
    });

    toast.success("Estudiante agregado exitosamente");
    router.push(`/cursos/${course.id}`);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Agregar Estudiante al Curso</h1>
        <p className="text-muted-foreground">
          Selecciona un estudiante para agregarlo a {course.name}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="student">Estudiante</Label>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un estudiante" />
            </SelectTrigger>
            <SelectContent>
              {studentsQuery.data?.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={student.image ?? "/avatar.jpg"}
                        alt={student.name ?? "Estudiante"}
                      />
                      <AvatarFallback>{student.name}</AvatarFallback>
                    </Avatar>

                    <p>{student.name}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={addStudentMutation.isPending}>
            Agregar Estudiante
          </Button>
        </div>
      </form>
    </div>
  );
};
