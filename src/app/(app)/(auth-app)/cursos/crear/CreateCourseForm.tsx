"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseMode, type Program, type User } from "@prisma/client";
import { parseCourseMode } from "@/lib/parser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  programId?: string;
  teacherId?: string;
  mode?: string;
  programs: Program[];
  teachers: User[];
}

export const CreateCourseForm: React.FC<Props> = ({
  teacherId,
  mode,
  programId,
  programs,
  teachers,
}) => {
  const router = useRouter();
  const [form, setForm] = useState(() => ({
    name: "",
    semester: "",
    credits: 1,
    hours: 1,
    mode: mode ?? "",
    programId: programId ?? "",
    teacherId: teacherId ?? "",
  }));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const createCourse = api.course.createCourse.useMutation({
    onError(error) {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      if (
        !form.name ||
        !form.mode ||
        !form.programId ||
        !form.teacherId ||
        !form.credits ||
        !form.hours
      ) {
        toast.error("Por favor completa los datos!");
        return;
      }

      await createCourse.mutateAsync({
        name: form.name.trim(),
        semester: form.semester.trim(),
        credits: form.credits,
        hours: form.hours,
        mode: form.mode as CourseMode,
        programId: form.programId,
        teacherId: form.teacherId,
      });

      toast.success("Curso creado exitosamente");
      router.push("/cursos");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Crear Nuevo Curso</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre del curso"
              required
              min={1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="semester">Semestre</Label>
            <Input
              id="semester"
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
              placeholder={`Semestre (${new Date().getFullYear().toString()}-II)`}
              required
              min={1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credits">Créditos</Label>
            <Input
              id="credits"
              value={form.credits}
              onChange={(e) =>
                setForm({ ...form, credits: parseInt(e.target.value) })
              }
              placeholder="Cantidad de créditos"
              required
              type="number"
              min={1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Horas</Label>
            <Input
              id="hours"
              value={form.hours}
              onChange={(e) =>
                setForm({ ...form, hours: parseInt(e.target.value) })
              }
              placeholder="Cantidad de horas"
              required
              type="number"
              min={1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode">Modo</Label>

            <Select
              onValueChange={(mode) => setForm({ ...form, mode })}
              defaultValue={mode ?? undefined}
            >
              <SelectTrigger id="mode" className="w-full">
                <SelectValue placeholder="Seleccionar el modo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Modo</SelectLabel>

                  {Object.values(CourseMode).map((courseMode) => (
                    <SelectItem key={courseMode} value={courseMode}>
                      {parseCourseMode(courseMode)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="programId">Programa</Label>

            <Select
              onValueChange={(programId) => setForm({ ...form, programId })}
              defaultValue={programId ?? undefined}
            >
              <SelectTrigger id="programId" className="w-full">
                <SelectValue placeholder="Seleccionar el programa" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Programa</SelectLabel>

                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacherId">Docente</Label>

            <Select
              onValueChange={(teacherId) => setForm({ ...form, teacherId })}
              defaultValue={teacherId ?? undefined}
            >
              <SelectTrigger id="teacherId" className="w-full">
                <SelectValue placeholder="Seleccionar el docente" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Docente</SelectLabel>

                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={teacher.image ?? "/avatar.jpg"}
                            alt={teacher.name ?? "Docente"}
                          />
                          <AvatarFallback>{teacher.name}</AvatarFallback>
                        </Avatar>

                        <p>
                          {teacher.name} - {teacher.email}
                        </p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createCourse.isPending || isLoading}
          >
            {createCourse.isPending || isLoading ? "Creando..." : "Crear Curso"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
