import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";

export const adminRouter = createTRPCRouter({
  getAdminById: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id: adminId } = input;

      const mySession = ctx.session;

      if (mySession.user.role !== Role.Admin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tienes permiso para ver al administrador.",
        });
      }

      const foundAdmin = await ctx.db.user.findUnique({
        where: {
          id: adminId,
          role: Role.Admin,
        },
      });

      if (!foundAdmin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `No existe el alumno con id ${adminId}.`,
        });
      }

      return foundAdmin;
    }),

  editAdmin: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().trim(),
        avatar: z.string().trim().optional(),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { avatar, name, email, id: adminId } = input;

      const mySession = ctx.session.user;

      if (mySession.role !== Role.Admin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tienes permiso para editar al alumno.",
        });
      }

      const updatedAdmin = await ctx.db.user.update({
        where: {
          id: adminId,
          role: Role.Admin,
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

      return updatedAdmin;
    }),

  deleteAdmin: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: adminId } = input;

      const mySession = ctx.session;

      if (mySession.user.role !== Role.Admin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tienes permisos para eliminar al administrador.",
        });
      }

      if (mySession.user.id === adminId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tienes permisos para eliminar al administrador.",
        });
      }

      // TODO: expected error, fix later
      const deletedAdmin = await ctx.db.user.delete({
        where: {
          id: adminId,
        },
      });

      return deletedAdmin;
    }),

  getAdmins: protectedProcedure
    .input(
      z.object({
        quantity: z.number().positive(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { quantity } = input;

      const mySession = ctx.session.user;

      if (mySession.role !== Role.Admin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tienes permiso para ver.",
        });
      }

      const admins = await ctx.db.user.findMany({
        where: {
          role: Role.Admin,
        },
        take: quantity,
      });

      return admins;
    }),

  getAllAdmins: protectedProcedure
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
          message: "No tienes permisos para ver los administradores.",
        });
      }

      const admins = await ctx.db.user.findMany({
        where: {
          role: Role.Admin,
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

      return admins;
    }),
});
