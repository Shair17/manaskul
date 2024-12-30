import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";

export const studentRouter = createTRPCRouter({
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  // return students based on user role (if is admin, all, if is teacher then return only their students)
  getStudents: protectedProcedure
    .input(
      z.object({
        quantity: z.number().positive(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { quantity } = input;

      const mySession = ctx.session.user;

      if (mySession.role === Role.Student) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tienes permiso para ver al alumno.",
        });
      }

      const students = await ctx.db.user.findMany({
        where: {
          role: Role.Student,

          ...(mySession.role === Role.Instructor
            ? {
                coursesTaken: {
                  some: {
                    course: {
                      teacher: {
                        id: mySession.id,
                      },
                    },
                  },
                },
              }
            : {}),
        },
        take: quantity,
        orderBy: {
          name: "asc",
        },
      });

      return students;
    }),

  getAllStudents: protectedProcedure
    .input(
      z.object({
        search: z.string().trim().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { search } = input;

      const mySession = ctx.session;

      if (mySession.user.role === Role.Student) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tienes permisos para ver los estudiantes.",
        });
      }

      const students = await ctx.db.user.findMany({
        where: {
          role: Role.Student,

          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),

          ...(mySession.user.role === Role.Instructor
            ? {
                coursesTaken: {
                  some: {
                    course: {
                      teacher: {
                        id: mySession.user.id,
                      },
                    },
                  },
                },
              }
            : {}),
        },
        orderBy: {
          name: "asc",
        },
      });

      return students;
    }),

  editStudent: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().trim(),
        avatar: z.string().trim().optional(),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { avatar, name, email, id: studentId } = input;

      const mySession = ctx.session.user;

      if (mySession.role !== Role.Admin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tienes permiso para editar al alumno.",
        });
      }

      const updatedStudent = await ctx.db.user.update({
        where: {
          id: studentId,
        },
        data: avatar
          ? {
              image: avatar,
              name,
              email,
            }
          : {
              name,
              email,
            },
      });

      return updatedStudent;
    }),

  getStudentById: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id: studentId } = input;

      const foundStudent = await ctx.db.user.findUnique({
        where: {
          id: studentId,
          role: Role.Student,
        },
        include: {
          coursesTaken: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!foundStudent) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `No existe el alumno con id ${studentId}.`,
        });
      }

      return foundStudent;
    }),

  deleteStudent: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: studentId } = input;

      const mySession = ctx.session;

      if (mySession.user.role !== Role.Admin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tienes permisos para eliminar al estudiante.",
        });
      }

      // TODO: expected error, fix later
      const deletedStudent = await ctx.db.user.delete({
        where: {
          id: studentId,
        },
      });

      return deletedStudent;
    }),
});
