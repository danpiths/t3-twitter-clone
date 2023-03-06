import { z } from "zod";
import { pusher } from "../root";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const likeRouter = createTRPCRouter({
  likeTweet: protectedProcedure
    .input(z.object({ tweetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const likeTweet = await ctx.prisma.like.create({
          data: {
            tweet: { connect: { id: input.tweetId } },
            user: { connect: { id: ctx.session.user.id } },
          },
          select: {
            tweetId: true,
          },
        });
        pusher.trigger("twitter-clone", "tweetLikeChange", {
          tweetId: likeTweet.tweetId,
        });
        return likeTweet;
      } catch (error) {}
    }),
  deleteLike: protectedProcedure
    .input(z.object({ tweetId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const dislikeTweet = await ctx.prisma.like.delete({
          where: {
            tweetId_userId: { tweetId: input.tweetId, userId: input.userId },
          },
          select: {
            tweetId: true,
          },
        });
        pusher.trigger("twitter-clone", "tweetLikeChange", {
          tweetId: dislikeTweet.tweetId,
        });
        return dislikeTweet;
      } catch (error) {}
    }),
});
