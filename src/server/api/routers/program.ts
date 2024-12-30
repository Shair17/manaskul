import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";

export const programRouter = createTRPCRouter({
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  getPrograms: protectedProcedure
    .input(
      z.object({
        quantity: z.number().positive(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { quantity } = input;

      // const mySession = ctx.session.user;

      const programs = await ctx.db.program.findMany({
        take: quantity,
        include: { courses: true },
      });

      return programs;
    }),

  getAllPrograms: protectedProcedure
    .input(
      z.object({
        search: z.string().trim().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { search } = input;

      const programs = await ctx.db.program.findMany({
        where: {
          ...(search
            ? {
                OR: [{ name: { contains: search, mode: "insensitive" } }],
              }
            : {}),
        },
        include: {
          courses: true,
        },
      });

      return programs;
    }),

  createProgram: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name } = input;

      const mySession = ctx.session;

      if (mySession.user.role !== Role.Admin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tienes permisos para crear un nuevo programa.",
        });
      }

      const createdProgram = await ctx.db.program.create({
        data: {
          name,
        },
      });

      return createdProgram;
    }),

  deleteProgram: protectedProcedure
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
          message: "No tienes permisos para eliminar el programa.",
        });
      }

      // TODO: expected error, fix later
      const deletedProgram = await ctx.db.program.delete({
        where: {
          id,
        },
      });

      return deletedProgram;
    }),

  editProgram: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().trim(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, id: programId } = input;

      const mySession = ctx.session.user;

      if (mySession.role !== Role.Admin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tienes permiso para editar el programa.",
        });
      }

      const updatedProgram = await ctx.db.program.update({
        where: {
          id: programId,
        },
        data: {
          name,
        },
      });

      return updatedProgram;
    }),

  getProgramById: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const foundProgram = await ctx.db.program.findUnique({
        where: {
          id,
        },
        include: { courses: true },
      });

      if (!foundProgram) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `No existe el programa con id ${id}.`,
        });
      }

      return foundProgram;
    }),
});
