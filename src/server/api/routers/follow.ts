import { z } from "zod";
import { pusher } from "../root";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const followRouter = createTRPCRouter({
  followUser: protectedProcedure
    .input(z.object({ followingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const follow = await ctx.prisma.follows.create({
          data: {
            following: { connect: { id: input.followingId } },
            follower: { connect: { id: ctx.session.user.id } },
          },
          select: {
            followerId: true,
            followingId: true,
          },
        });
        await pusher.trigger("twitter-clone", "followChange", {
          followerId: follow.followerId,
          followingId: follow.followingId,
        });
        return follow;
      } catch (error) {}
    }),
  unfollowUser: protectedProcedure
    .input(z.object({ followingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const unfollow = await ctx.prisma.follows.delete({
          where: {
            followerId_followingId: {
              followerId: ctx.session.user.id,
              followingId: input.followingId,
            },
          },
          select: {
            followerId: true,
            followingId: true,
          },
        });
        await pusher.trigger("twitter-clone", "followChange", {
          followerId: unfollow.followerId,
          followingId: unfollow.followingId,
        });
        return unfollow;
      } catch (error) {}
    }),
  getFollowing: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;
      const { cursor } = input;
      const items = await ctx.prisma.follows.findMany({
        where: {
          followerId: input.userId,
        },
        include: {
          following: { select: { image: true, id: true, name: true } },
        },
        orderBy: { followedAt: "desc" },
        take: limit + 1,
        cursor: cursor ? { followedAt: cursor } : undefined,
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        if (nextItem !== undefined && nextItem !== null) {
          nextCursor = nextItem.followedAt.toISOString();
        }
      }
      return {
        items,
        nextCursor,
      };
    }),
  getFollowers: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;
      const { cursor } = input;
      const items = await ctx.prisma.follows.findMany({
        where: {
          followingId: input.userId,
        },
        include: {
          follower: { select: { image: true, id: true, name: true } },
        },
        orderBy: { followedAt: "desc" },
        take: limit + 1,
        cursor: cursor ? { followedAt: cursor } : undefined,
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        if (nextItem !== undefined && nextItem !== null) {
          nextCursor = nextItem.followedAt.toISOString();
        }
      }
      return {
        items,
        nextCursor,
      };
    }),
});
