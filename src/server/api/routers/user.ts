import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Role } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { parseRole } from "@/lib/parser";

export const userRouter = createTRPCRouter({
  createUser: protectedProcedure
    .input(
      z.object({
        role: z.nativeEnum(Role),

        name: z.string().trim(),
        avatar: z.string().trim().optional(),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, avatar, email, role } = input;

      const mySession = ctx.session;

      if (mySession.user.role !== Role.Admin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `No tienes permisos para crear un nuevo usuario con rol ${parseRole(role)}.`,
        });
      }

      const foundUser = await ctx.db.user.findUnique({
        where: {
          email,
          role,
        },
      });

      if (foundUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `El usuario con el correo ${email} y rol ${parseRole(role)} ya existe, intenta con otro correo.`,
        });
      }

      const createdUser = await ctx.db.user.create({
        data: {
          name,
          email,
          image: avatar,
          role,
          emailVerified: new Date(),
        },
      });

      return createdUser;
    }),

  completeProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().trim(),
        avatar: z.string().trim().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { avatar, name } = input;
      const userId = ctx.session.user.id;

      const updatedProfile = await ctx.db.user.update({
        where: {
          id: userId,
        },
        data: avatar
          ? {
              image: avatar,
              name,
            }
          : {
              name,
            },
      });

      return updatedProfile;
    }),
});
