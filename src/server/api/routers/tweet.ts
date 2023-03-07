import type { Follows } from "@prisma/client";
import { z } from "zod";
import { pusher } from "../root";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const tweetRouter = createTRPCRouter({
  getTweets: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const limit = input.limit ?? 10;
        const { cursor } = input;
        const followingUsers: {
          following: Follows[];
        } | null = await ctx.prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { following: true },
        });
        if (followingUsers) {
          const items = await ctx.prisma.tweet.findMany({
            where: {
              userId: {
                in: [
                  ...followingUsers.following.map(
                    (follows) => follows.followingId
                  ),
                  ctx.session.user.id,
                ],
              },
            },
            include: {
              user: { select: { image: true, name: true } },
              _count: { select: { likes: true } },
              likes: { where: { userId: ctx.session.user.id } },
            },
            orderBy: { createdAt: "desc" },
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
        }
      } catch (error) {}
    }),
  getSingleUserTweets: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const limit = input.limit ?? 10;
        const { cursor } = input;
        const items = await ctx.prisma.tweet.findMany({
          where: { userId: input.userId },
          include: {
            user: { select: { image: true, name: true } },
            _count: { select: { likes: true } },
            likes: { where: { userId: ctx.session.user.id } },
          },
          orderBy: { createdAt: "desc" },
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
  create: protectedProcedure
    .input(z.object({ text: z.string().min(5).max(200) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const newTweet = await ctx.prisma.tweet.create({
          data: {
            text: input.text,
            user: { connect: { id: ctx.session.user.id } },
          },
        });
        await pusher.trigger("twitter-clone", "tweetChange", {
          userId: newTweet.userId,
        });
        return newTweet;
      } catch (error) {}
    }),
});
