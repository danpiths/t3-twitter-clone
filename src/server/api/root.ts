import { followRouter } from "./routers/follow";
import { likeRouter } from "./routers/like";
import { tweetRouter } from "./routers/tweet";
import { userRouter } from "./routers/user";
import { createTRPCRouter } from "./trpc";
import Pusher from "pusher";
import { env } from "../../env.mjs";

export const pusher = new Pusher({
  appId: env.PUSHER_APP_ID,
  key: env.NEXT_PUBLIC_PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
});

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  tweet: tweetRouter,
  like: likeRouter,
  follow: followRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
