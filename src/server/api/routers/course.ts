import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { CourseMode, Role } from "@prisma/client";

export const courseRouter = createTRPCRouter({
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  editCourse: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().trim(),
        credits: z.number().positive(),
        hours: z.number().positive(),
        mode: z.nativeEnum(CourseMode),
        programId: z.string().cuid(),
        teacherId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        name,
        id: courseId,
        credits,
        hours,
        mode,
        programId,
        teacherId,
      } = input;

      const mySession = ctx.session.user;

      if (mySession.role !== Role.Admin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tienes permiso para editar el curso.",
        });
      }

      const updatedCourse = await ctx.db.course.update({
        where: {
          id: courseId,
        },
        data: {
          name,
          credits,
          hours,
          mode,
          program: {
            update: {
              id: programId,
            },
          },
          teacher: {
            update: {
              id: teacherId,
            },
          },
        },
      });

      return updatedCourse;
    }),

  addStudent: protectedProcedure
    .input(
      z.object({
        courseId: z.string().cuid(),
        studentId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { courseId, studentId } = input;

      const mySession = ctx.session.user;

      if (mySession.role !== Role.Admin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "No tienes permisos para agregar un nuevo estudiante al curso.",
        });
      }

      const student = await ctx.db.user.findUnique({
        where: {
          id: studentId,
          role: Role.Student,
        },
      });

      if (!student) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No se encontró al estudiante.",
        });
      }

      const course = await ctx.db.course.findUnique({
        where: {
          id: courseId,
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No se encontró el curso.",
        });
      }

      const existingEnrollment = await ctx.db.enrollment.findFirst({
        where: {
          courseId,
          studentId,
        },
      });

      if (existingEnrollment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El estudiante ya está inscrito en este curso.",
        });
      }

      const enrollment = await ctx.db.enrollment.create({
        data: {
          courseId,
          studentId,
        },
      });

      return enrollment;
    }),

  removeStudent: protectedProcedure
    .input(
      z.object({
        courseId: z.string().cuid(),
        studentId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { courseId, studentId } = input;

      const mySession = ctx.session;

      if (mySession.user.role !== Role.Admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No tienes permisos para realizar esta acción.",
        });
      }

      const enrollment = await ctx.db.enrollment.findFirst({
        where: {
          courseId,
          studentId,
        },
      });

      if (!enrollment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El estudiante no está inscrito en este curso.",
        });
      }

      await ctx.db.enrollment.delete({
        where: {
          id: enrollment.id,
        },
      });

      return enrollment;
    }),

  getCourseById: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const foundCourse = await ctx.db.course.findUnique({
        where: {
          id,
        },
        include: {
          enrollments: {
            include: {
              course: true,
              grades: true,
              student: true,
            },
          },
          program: true,
          teacher: true,
        },
      });

      if (!foundCourse) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `No existe el curso con id ${id}.`,
        });
      }

      return foundCourse;
    }),

  deleteCourse: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const mySession = ctx.session;

      if (mySession.user.role !== Role.Admin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tienes permisos para eliminar el curso.",
        });
      }

      // TODO: expected error, fix later
      const deletedCourse = await ctx.db.course.delete({
        where: {
          id,
        },
      });

      return deletedCourse;
    }),

  getAllCourses: protectedProcedure
    .input(
      z.object({
        search: z.string().trim().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { search } = input;
      const mySession = ctx.session.user;

      const courses = await ctx.db.course.findMany({
        where: {
          ...(search
            ? {
                OR: [{ name: { contains: search, mode: "insensitive" } }],
              }
            : {}),

          ...(mySession.role === Role.Instructor
            ? {
                teacher: {
                  id: mySession.id,
                },
              }
            : {}),

          ...(mySession.role === Role.Student
            ? {
                enrollments: {
                  some: {
                    student: {
                      id: mySession.id,
                    },
                  },
                },
              }
            : {}),
        },
        include: {
          enrollments: true,
          teacher: true,
          program: true,
        },
      });

      return courses;
    }),

  createCourse: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        semester: z.string(),
        credits: z.number().positive(),
        hours: z.number().positive(),
        mode: z.nativeEnum(CourseMode),
        programId: z.string().cuid(),
        teacherId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { credits, hours, mode, name, programId, teacherId, semester } =
        input;

      const foundTeacher = await ctx.db.user.findUnique({
        where: {
          id: teacherId,
          role: Role.Instructor,
        },
      });

      if (!foundTeacher) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No se encontró al docente.",
        });
      }

      const foundProgam = await ctx.db.program.findUnique({
        where: {
          id: programId,
        },
      });

      if (!foundProgam) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No se encontró el programa.",
        });
      }

      const createdCourse = await ctx.db.course.create({
        data: {
          semester,
          credits,
          hours,
          mode,
          name,
          program: {
            connect: {
              id: foundProgam.id,
            },
          },
          teacher: {
            connect: {
              id: foundTeacher.id,
            },
          },
        },
      });

      return createdCourse;
    }),

  getCourses: protectedProcedure
    .input(
      z.object({
        quantity: z.number().positive(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { quantity } = input;

      const mySession = ctx.session.user;

      // const mySession = ctx.session.user;

      const courses = await ctx.db.course.findMany({
        where: {
          ...(mySession.role === Role.Instructor
            ? {
                teacher: {
                  id: mySession.id,
                },
              }
            : {}),

          ...(mySession.role === Role.Student
            ? {
                enrollments: {
                  some: {
                    student: {
                      id: mySession.id,
                    },
                  },
                },
              }
            : {}),
        },
        take: quantity,
        include: { teacher: true, program: true },
      });

      return courses;
    }),
});
