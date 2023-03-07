import { useEffect } from "react";
import type { FC } from "react";
import { BeatLoader, SyncLoader } from "react-spinners";
import { api } from "../../utils/api";
import SingleTweet from "./SingleTweet";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { pusher } from "../../lib/Pusher";
import { useSession } from "next-auth/react";

const UserFeed: FC = () => {
  const tweets = api.tweet.getTweets.useInfiniteQuery(
    { limit: 5 },
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
    }
  );
  const { data: user } = api.user.getSelf.useQuery();
  const [parent] = useAutoAnimate();
  const TRPCContext = api.useContext();
  const { data: session } = useSession();

  useEffect(() => {
    if (user && tweets.data?.pages.length) {
      const tweetsChannel = pusher.subscribe("twitter-clone");
      tweetsChannel.bind("tweetChange", async (data: { userId: string }) => {
        if (
          session?.user.id &&
          user &&
          user.following.filter(
            (follow) =>
              follow.followerId === session.user.id &&
              follow.followingId === data.userId
          ).length > 0
        ) {
          await TRPCContext.tweet.getTweets.invalidate();
        }
      });
      tweetsChannel.bind(
        "tweetLikeChange",
        async (data: { tweetId: string }) => {
          if (
            tweets.data?.pages
              .map((page) => {
                const temp = page?.items.filter(
                  (tweet) => tweet.id === data.tweetId
                );
                return temp?.length && temp.length > 0;
              })
              .includes(true)
          ) {
            await TRPCContext.tweet.getTweets.invalidate();
          }
        }
      );
      tweetsChannel.bind("userChange", async (data: { userId: string }) => {
        if (
          tweets.data?.pages
            .map((page) => {
              const temp = page?.items.filter(
                (tweet) => tweet.userId === data.userId
              );
              return temp?.length && temp.length > 0;
            })
            .includes(true)
        ) {
          await TRPCContext.tweet.getTweets.invalidate();
        }
      });
      return () => {
        pusher.unsubscribe("twitter-clone");
      };
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tweets]);

  useEffect(() => {
    const onScroll = async (e: Event) => {
      if (e.target) {
        const doc = e.target as Document;
        if (doc.scrollingElement) {
          const { scrollHeight, scrollTop, clientHeight } =
            doc.scrollingElement;
          if (scrollHeight - scrollTop <= clientHeight * 1.5) {
            !tweets.isFetchingNextPage &&
              tweets.hasNextPage &&
              (await tweets.fetchNextPage());
          }
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    document.addEventListener("scroll", onScroll);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      document.removeEventListener("scroll", onScroll);
    };
  }, [tweets]);

  return tweets.isLoading ? (
    <div className="flex flex-1 items-center justify-center">
      <SyncLoader color="#f1f5f9" size={7} />
    </div>
  ) : tweets.data?.pages.every(
      (page) => page?.items && page.items.length > 0
    ) ? (
    <div className="mt-3 flex w-full flex-col gap-3" ref={parent}>
      {tweets.data.pages.map((page) =>
        page?.items.map((tweet) => <SingleTweet tweet={tweet} key={tweet.id} />)
      )}
      {tweets.isFetchingNextPage ? (
        <BeatLoader color="#f1f5f9" size={7} className="mx-auto mt-4" />
      ) : (
        <></>
      )}
    </div>
  ) : (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <p className="font-bold">
        There are no tweets :(
        <span className="mx-auto mt-1 block w-5/6 text-xs font-normal md:w-2/3 md:text-sm">
          Try following some people from the search bar or tweet to populate
          your feed
        </span>
      </p>
    </div>
  );
};

export default UserFeed;
