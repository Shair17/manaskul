"use client";

import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CourseMode, Grade, User, Program } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { EnrollmentActionsColumn } from "./EnrollmentActionsColumn";

export type Enrollment = {
  id: string;

  grades: Omit<Grade, "enrollmentId">[];

  student: Pick<User, "id" | "email" | "name" | "image" | "role">;
  studentId: string;

  courseId: string;
  course: {
    program: Program;
    name: string;
    id: string;
    mode: CourseMode;
    credits: number;
    hours: number;
    teacher: Pick<User, "id" | "email" | "name" | "image" | "role">;
  };
};

export const columns: ColumnDef<Enrollment>[] = [
  {
    accessorKey: "student",
    header: "Estudiante",
    cell: ({ row }) => {
      const student = row.original.student;

      return (
        <div className="capitalize">
          <Link
            href={`/estudiantes/${student.id}`}
            className="flex items-center gap-2 underline"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={student.image ?? undefined}
                alt={student.name ?? "Estudiante"}
              />
              <AvatarFallback>{student?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{student.name}</span>
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "teacher",
    header: "Docente",
    cell: ({ row }) => {
      const teacher = row.original.course.teacher;

      return (
        <div className="capitalize">
          <Link
            href={`/docentes/${teacher.id}`}
            className="flex items-center gap-2 underline"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={teacher.image ?? undefined}
                alt={teacher.name ?? "Estudiante"}
              />
              <AvatarFallback>{teacher?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{teacher.name}</span>
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "course",
    header: "Curso",
    cell: ({ row }) => {
      const course = row.original.course;

      return (
        <div className="capitalize">
          <Link
            href={`/cursos/${course.id}`}
            className="flex items-center gap-2 underline"
          >
            {course.name}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "program",
    header: "Programa",
    cell: ({ row }) => {
      const program = row.original.course.program;

      return (
        <div className="capitalize">
          <Link
            href={`/programas/${program.id}`}
            className="flex items-center gap-2 underline"
          >
            {program.name}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "grades",
    header: () => <div className="text-right">Notas</div>,
    cell: ({ row }) => {
      const grades = row.original.grades;

      const totalGrades = grades.length;
      // 3 -> 3 unidades
      const averageScore =
        grades.reduce((acc, grade) => acc + grade.score, 0) / 3;

      return (
        <div className="flex items-center justify-end gap-2">
          {totalGrades === 0 ? (
            <div className="text-sm text-muted-foreground">Sin notas</div>
          ) : (
            <>
              <div className="flex -space-x-1">
                {grades.map((grade) => (
                  <div
                    key={grade.id}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted"
                    title={`Unidad ${grade.unit}: ${grade.score}`}
                  >
                    {grade.score}
                  </div>
                ))}
              </div>

              <div
                className={`ml-2 flex h-8 w-8 items-center justify-center rounded-full font-semibold ${
                  averageScore >= 14
                    ? "bg-green-100 text-green-700"
                    : averageScore >= 11
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}
                title="Promedio"
              >
                {averageScore.toFixed(0)}
              </div>
            </>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const enrollment = row.original;

      return (
        <EnrollmentActionsColumn
          enrollment={enrollment}
          hasGrades={!(row.original.grades.length === 0)}
        />
      );
    },
  },
];

interface Props {
  data: Enrollment[];
}

export const GradesStudentDataTable: React.FC<Props> = ({ data }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};
