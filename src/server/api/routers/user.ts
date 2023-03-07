import { v2 } from "cloudinary";
import { z } from "zod";
import { pusher } from "../root";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  delete: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await v2.uploader.destroy(`twitter-clone/${ctx.session.user.id}`, {
        resource_type: "image",
      });
      return ctx.prisma.user.delete({
        where: { id: ctx.session.user.id },
      });
    } catch (error) {}
  }),
  getSelf: protectedProcedure.query(({ ctx }) => {
    try {
      return ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          email: true,
          image: true,
          name: true,
          _count: {
            select: { followers: true, following: true, tweets: true },
          },
          following: true,
        },
      });
    } catch (error) {}
  }),
  edit: protectedProcedure
    .input(
      z.object({ name: z.string().min(3).trim(), image: z.string().nullish() })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (input.image && input.image?.length > 1) {
          const updatedUser = await ctx.prisma.user.update({
            where: { id: ctx.session.user.id },
            data: { name: input.name, image: input.image },
          });
          await pusher.trigger("twitter-clone", "userChange", {
            userId: updatedUser.id,
          });
          return updatedUser;
        }
        const updatedUser = await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { name: input.name },
        });
        await pusher.trigger("twitter-clone", "userChange", {
          userId: updatedUser.id,
        });
      } catch (error) {}
    }),
  getSingleUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) => {
      try {
        return ctx.prisma.user.findUnique({
          where: { id: input.userId },
          select: {
            image: true,
            name: true,
            _count: {
              select: { followers: true, following: true, tweets: true },
            },
            followers: { where: { followerId: ctx.session.user.id } },
          },
        });
      } catch (error) {}
    }),
  searchUsers: protectedProcedure
    .input(
      z.object({
        userName: z.string(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const limit = input.limit ?? 10;
        const { cursor } = input;
        const items = await ctx.prisma.user.findMany({
          where: {
            AND: {
              name: {
                contains: input.userName,
                mode: "insensitive",
              },
              id: { not: ctx.session.user.id },
            },
          },
          select: {
            id: true,
            image: true,
            name: true,
            _count: { select: { followers: true } },
          },
          orderBy: { followers: { _count: "desc" } },
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
        });
        let nextCursor: typeof cursor | undefined = undefined;
        if (items.length > limit) {
          const nextItem = items.pop();
          if (nextItem !== undefined && nextItem !== null) {
            nextCursor = nextItem.id;
          }
        }
        return {
          items,
          nextCursor,
        };
      } catch (error) {}
    }),
});
