import { NextPage } from "next";
import Image from "next/image";
import ProtectedRoute from "../../components/ProtectedRoute";
import defaultUserProfile from "../../../public/defaultUserProfile.svg";
import { api } from "../../utils/api";
import { BeatLoader, SyncLoader } from "react-spinners";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Head from "next/head";
import SingleTweet from "../../components/Tweet/SingleTweet";
import SearchBar from "../../components/Navigation/SearchBar";
import { pusher } from "../../lib/Pusher";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const UserPage: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = router.query.userId as string;
  const { data: user, isLoading } = api.user.getSingleUser.useQuery({ userId });
  const followUser = api.follow.followUser.useMutation();
  const unfollowUser = api.follow.unfollowUser.useMutation();
  const tweets = api.tweet.getSingleUserTweets.useInfiniteQuery(
    { limit: 3, userId },
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
    }
  );
  const TRPCContext = api.useContext();
  const [parent] = useAutoAnimate();

  useEffect(() => {
    if (session?.user && status === "authenticated") {
      session.user.id === userId && router.push("/dashboard");
    }
  }, [session]);

  useEffect(() => {
    const followChannel = pusher.subscribe("twitter-clone");
    followChannel.bind(
      "followChange",
      (data: { followerId: string; followingId: string }) => {
        if (
          data.followerId === session?.user.id ||
          data.followingId === session?.user.id
        ) {
          TRPCContext.user.getSingleUser.invalidate();
        }
      }
    );
    const tweetsChannel = pusher.subscribe("twitter-clone");
    tweetsChannel.bind("tweetChange", (data: { userId: string }) => {
      if (data.userId === userId) {
        TRPCContext.tweet.getSingleUserTweets.invalidate();
      }
    });
    tweetsChannel.bind("tweetLikeChange", (data: { tweetId: string }) => {
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
        TRPCContext.tweet.getSingleUserTweets.invalidate();
      }
    });
  }, [userId, tweets]);

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

    document.addEventListener("scroll", onScroll);
    return () => {
      document.removeEventListener("scroll", onScroll);
    };
  }, [tweets]);

  const handleFollowClick = () => {
    followUser.mutate(
      { followingId: userId },
      {
        onSuccess: () => {
          TRPCContext.user.getSingleUser.invalidate({ userId });
          TRPCContext.tweet.getTweets.invalidate();
        },
      }
    );
  };

  const handleUnfollowClick = () => {
    unfollowUser.mutate(
      { followingId: userId },
      {
        onSuccess: () => {
          TRPCContext.user.getSingleUser.invalidate({ userId });
          TRPCContext.tweet.getTweets.invalidate();
        },
      }
    );
  };

  return (
    <ProtectedRoute>
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <SyncLoader color="#f1f5f9" size={7} />
        </div>
      ) : (
        <>
          <Head>
            <title>{user?.name?.split(" ")[0]}'s Profile</title>
          </Head>
          <div className="mt-4 flex flex-1 flex-col md:mx-auto md:w-1/3">
            <SearchBar />
            <div className="mt-4 flex items-center gap-3">
              <Image
                src={user?.image ? user.image : defaultUserProfile}
                alt={`${user?.name}'s Image`}
                width={100}
                height={100}
                className="h-16 w-16 rounded-full object-cover object-center"
              />
              <div>
                <p className="text-lg font-bold">{user?.name}</p>
                <button
                  className={`primary-btn mt-1 ${
                    user?.followers.length
                      ? `bg-rose-400 px-2 py-1 text-sm capitalize hover:bg-rose-500 focus:bg-rose-500 focus:ring-rose-500 active:bg-rose-700 active:ring-rose-700`
                      : `bg-blue-400 px-2 py-1 text-sm capitalize hover:bg-blue-500 focus:bg-blue-500 focus:ring-blue-500 active:bg-blue-700 active:ring-blue-700`
                  } disabled:cursor-not-allowed disabled:bg-gray-400`}
                  onClick={() =>
                    user?.followers.length
                      ? handleUnfollowClick()
                      : handleFollowClick()
                  }
                  disabled={followUser.isLoading || unfollowUser.isLoading}
                >
                  {followUser.isLoading
                    ? "Following..."
                    : unfollowUser.isLoading
                    ? "Unfollowing..."
                    : user?.followers.length
                    ? "Unfollow"
                    : "Follow"}
                </button>
              </div>
            </div>
            <div className="mt-7 flex justify-between">
              <div>
                <p className="font-bold">Tweets</p>
                <p className="text-center">{user?._count.tweets}</p>
              </div>
              <div>
                <p className="font-bold">Followers</p>
                <p className="text-center">{user?._count.followers}</p>
              </div>
              <div>
                <p className="font-bold">Following</p>
                <p className="text-center">{user?._count.following}</p>
              </div>
            </div>
            <div className="mt-7">
              {tweets.isLoading ? (
                <div className="flex flex-1 items-center justify-center">
                  <SyncLoader color="#f1f5f9" size={7} />
                </div>
              ) : tweets.data?.pages.every(
                  (page) => page?.items && page.items.length > 0
                ) ? (
                <div className="flex w-full flex-col gap-3" ref={parent}>
                  {tweets.data.pages.map((page) =>
                    page?.items.map((tweet) => (
                      <SingleTweet tweet={tweet} key={tweet.id} />
                    ))
                  )}
                  {tweets.isFetchingNextPage ? (
                    <BeatLoader
                      color="#f1f5f9"
                      size={7}
                      className="mx-auto mt-4"
                    />
                  ) : (
                    <></>
                  )}
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <p className="font-bold">There are no tweets :(</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </ProtectedRoute>
  );
};

export default UserPage;
