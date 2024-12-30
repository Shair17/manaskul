import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Role } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const enrollmentRouter = createTRPCRouter({
  getAllEnrollmentsByStudent: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { search } = input;

      const mySession = ctx.session.user;

      if (mySession.role !== Role.Student) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Solo estudiantes pueden ver esto.",
        });
      }

      const enrollments = await ctx.db.enrollment.findMany({
        where: search
          ? {
              student: { id: mySession.id },
              OR: [
                {
                  student: {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
                {
                  course: {
                    OR: [
                      {
                        name: {
                          contains: search,
                          mode: "insensitive",
                        },
                      },
                      {
                        teacher: {
                          name: {
                            contains: search,
                            mode: "insensitive",
                          },
                        },
                      },
                      {
                        program: {
                          name: {
                            contains: search,
                            mode: "insensitive",
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            }
          : undefined,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
          course: {
            select: {
              id: true,
              name: true,
              credits: true,
              hours: true,
              mode: true,
              program: {
                select: {
                  id: true,
                  name: true,
                },
              },
              teacher: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  role: true,
                },
              },
            },
          },
          grades: {
            select: {
              id: true,
              unit: true,
              score: true,
            },
          },
        },
        orderBy: {
          student: {
            name: "asc",
          },
        },
      });

      return enrollments;
    }),

  getAllEnrollments: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { search } = input;

      const mySession = ctx.session.user;

      if (mySession.role === Role.Student) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tienes permisos para ver las inscripciones.",
        });
      }

      const enrollments = await ctx.db.enrollment.findMany({
        where: search
          ? {
              OR: [
                {
                  student: {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
                {
                  course: {
                    OR: [
                      {
                        name: {
                          contains: search,
                          mode: "insensitive",
                        },
                      },
                      {
                        teacher: {
                          name: {
                            contains: search,
                            mode: "insensitive",
                          },
                        },
                      },
                      {
                        program: {
                          name: {
                            contains: search,
                            mode: "insensitive",
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            }
          : undefined,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
          course: {
            select: {
              id: true,
              name: true,
              credits: true,
              hours: true,
              mode: true,
              program: {
                select: {
                  id: true,
                  name: true,
                },
              },
              teacher: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  role: true,
                },
              },
            },
          },
          grades: {
            select: {
              id: true,
              unit: true,
              score: true,
            },
          },
        },
        orderBy: {
          student: {
            name: "asc",
          },
        },
      });

      return enrollments;
    }),

  getEnrollmentsByStudent: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const enrollments = await ctx.db.enrollment.findMany({
        where: {
          studentId: input.studentId,
        },
        select: {
          id: true,
          course: {
            select: {
              id: true,
              name: true,
              credits: true,
              hours: true,
              mode: true,
              program: {
                select: {
                  id: true,
                  name: true,
                },
              },
              teacher: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  role: true,
                },
              },
            },
          },
          grades: {
            select: {
              id: true,
              unit: true,
              score: true,
            },
          },
        },
      });

      return enrollments;
    }),

  getGradesByEnrollment: protectedProcedure
    .input(
      z.object({
        enrollmentId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const grades = await ctx.db.grade.findMany({
        where: {
          enrollmentId: input.enrollmentId,
        },
        select: {
          id: true,
          unit: true,
          score: true,
        },
      });

      return grades;
    }),

  updateGrades: protectedProcedure
    .input(
      z.object({
        enrollmentId: z.string().cuid(),
        studentId: z.string().cuid(),
        grades: z.array(
          z.object({
            unit: z.number(),
            score: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { studentId, grades, enrollmentId } = input;

      // Check if the user is an admin or a teacher
      if (
        ctx.session.user.role !== Role.Admin &&
        ctx.session.user.role !== Role.Instructor
      ) {
        throw new Error("Only admins and teachers can update grades");
      }

      // Validate the student and course
      const student = await ctx.db.user.findUnique({
        where: { id: studentId, role: Role.Student },
      });

      if (!student) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `El estudiante con el id ${studentId} no existe.`,
        });
      }

      const enrollment = await ctx.db.enrollment.findUnique({
        where: { id: enrollmentId },
      });

      if (!enrollment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `El estudiante no pertenece a ese curso.`,
        });
      }

      const course = await ctx.db.course.findUnique({
        where: { id: enrollment.courseId },
      });

      if (!course) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `El curso con el id ${enrollment.courseId} no existe.`,
        });
      }

      // Validate the grades
      for (const grade of grades) {
        if (grade.unit < 1 || grade.unit > 3) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Unidad invalida!",
          });
        }

        if (grade.score < 0 || grade.score > 20) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Nota invalida!",
          });
        }
      }

      // Replace grades for the student
      await ctx.db.grade.deleteMany({
        where: {
          enrollmentId: enrollment.id,
        },
      });

      for (const grade of grades) {
        await ctx.db.grade.create({
          data: {
            unit: grade.unit,
            score: grade.score,
            enrollment: {
              connect: {
                id: enrollment.id,
              },
            },
          },
        });
      }

      return {
        success: true,
      };
    }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const enrollment = await ctx.db.enrollment.findUnique({
        where: {
          id,
        },
        include: {
          course: true,
          grades: true,
          student: true,
        },
      });

      if (!enrollment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No existe el estudiante en el curso.",
        });
      }

      return enrollment;
    }),
});
