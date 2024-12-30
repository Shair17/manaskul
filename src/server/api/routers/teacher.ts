import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";

export const teacherRouter = createTRPCRouter({
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  deleteTeacher: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: teacherId } = input;

      const mySession = ctx.session;

      if (mySession.user.role !== Role.Admin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tienes permisos para eliminar al docente.",
        });
      }

      // TODO: expected error, fix later
      const deletedTeacher = await ctx.db.user.delete({
        where: {
          id: teacherId,
        },
      });

      return deletedTeacher;
    }),

  editTeacher: protectedProcedure
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
          message: "No tienes permiso para editar al docente.",
        });
      }

      const updatedTeacher = await ctx.db.user.update({
        where: {
          id: studentId,
          role: Role.Instructor,
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

      return updatedTeacher;
    }),

  getTeacherById: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id: teacherId } = input;

      const foundTeacher = await ctx.db.user.findUnique({
        where: {
          id: teacherId,
          role: Role.Instructor,
        },
      });

      if (!foundTeacher) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `No existe el docente con id ${teacherId}.`,
        });
      }

      return foundTeacher;
    }),

  getTeachers: protectedProcedure
    .input(
      z.object({
        quantity: z.number().positive(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { quantity } = input;

      const mySession = ctx.session.user;

      if (mySession.role === Role.Instructor) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tienes permiso para ver.",
        });
      }

      // TODO: luego hacer la validacion para que me devuelva los profesores que tengo si soy alumno, si soy administrador entonces devuelve todos los administradores
      const teachers = await ctx.db.user.findMany({
        where: {
          role: Role.Instructor,
        },
        take: quantity,
      });

      return teachers;
    }),

  getAllTeachers: protectedProcedure
    .input(
      z.object({
        search: z.string().trim().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { search } = input;

      const mySession = ctx.session;

      if (mySession.user.role !== Role.Admin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tienes permisos para ver los docentes.",
        });
      }

      const teachers = await ctx.db.user.findMany({
        where: {
          role: Role.Instructor,
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
      });

      return teachers;
    }),
});
