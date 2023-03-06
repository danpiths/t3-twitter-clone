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
        pusher.trigger("twitter-clone", "followChange", {
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
        pusher.trigger("twitter-clone", "followChange", {
          followerId: unfollow.followerId,
          followingId: unfollow.followingId,
        });
        return unfollow;
      } catch (error) {}
    }),
});
