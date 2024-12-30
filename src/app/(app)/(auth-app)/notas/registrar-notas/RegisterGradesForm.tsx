"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { api } from "@/trpc/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const RegisterGradesForm: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedEnrollment, setSelectedEnrollment] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: students } = api.student.getAllStudents.useQuery({});
  const { data: enrollments } = api.enrollment.getEnrollmentsByStudent.useQuery(
    { studentId: selectedStudent },
    { enabled: !!selectedStudent },
  );
  const { data: grades } = api.enrollment.getGradesByEnrollment.useQuery(
    { enrollmentId: selectedEnrollment },
    { enabled: !!selectedEnrollment },
  );

  const updateGradeMutation = api.enrollment.updateGrades.useMutation({
    onError(error) {
      toast.error(error.message);
    },
  });

  const [unit1Score, setUnit1Score] = useState<string>("");
  const [unit2Score, setUnit2Score] = useState<string>("");
  const [unit3Score, setUnit3Score] = useState<string>("");

  useEffect(() => {
    if (grades) {
      grades.forEach((grade) => {
        switch (grade.unit) {
          case 1:
            setUnit1Score(grade.score.toString());
            break;
          case 2:
            setUnit2Score(grade.score.toString());
            break;
          case 3:
            setUnit3Score(grade.score.toString());
            break;
        }
      });
    }
  }, [grades]);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      setIsLoading(true);

      await updateGradeMutation.mutateAsync({
        studentId: selectedStudent,
        enrollmentId: selectedEnrollment,

        grades: [
          { unit: 1, score: parseFloat(unit1Score) },
          { unit: 2, score: parseFloat(unit2Score) },
          { unit: 3, score: parseFloat(unit3Score) },
        ],
      });

      toast.success("Notas registradas correctamente");
      router.refresh();
      router.push("/notas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="student">Estudiante</Label>

              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estudiante" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Estudiante</SelectLabel>

                    {students?.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        <div className="flex items-center gap-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={student.image ?? undefined}
                              alt={student.name ?? "Estudiante"}
                            />
                            <AvatarFallback>
                              {student?.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{student.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {selectedStudent && (
              <div className="space-y-2">
                <Label htmlFor="course">Curso</Label>

                <Select
                  value={selectedEnrollment}
                  onValueChange={setSelectedEnrollment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar curso" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Curso</SelectLabel>

                      {enrollments?.map((enrollment) => (
                        <SelectItem key={enrollment.id} value={enrollment.id}>
                          {enrollment.course.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedEnrollment && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="unit1">Nota Unidad 1</Label>
                  <Input
                    id="unit1"
                    type="number"
                    min="0"
                    max="20"
                    step="0.01"
                    value={unit1Score}
                    onChange={(e) => setUnit1Score(e.target.value)}
                    placeholder="0-20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit2">Nota Unidad 2</Label>
                  <Input
                    id="unit2"
                    type="number"
                    min="0"
                    max="20"
                    step="0.01"
                    value={unit2Score}
                    onChange={(e) => setUnit2Score(e.target.value)}
                    placeholder="0-20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit3">Nota Unidad 3</Label>
                  <Input
                    id="unit3"
                    type="number"
                    min="0"
                    max="20"
                    step="0.01"
                    value={unit3Score}
                    onChange={(e) => setUnit3Score(e.target.value)}
                    placeholder="0-20"
                    required
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || updateGradeMutation.isPending}
            >
              {isLoading || updateGradeMutation.isPending
                ? "Registrando..."
                : "Registrar Notas"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
