import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { BeatLoader, SyncLoader } from "react-spinners";
import ProtectedRoute from "../../components/ProtectedRoute";
import { pusher } from "../../lib/Pusher";
import { api } from "../../utils/api";

const Following: NextPage = () => {
  const router = useRouter();
  const userId = router.query.userId as string;
  const following = api.follow.getFollowing.useInfiniteQuery({
    userId,
    limit: 10,
  });
  const [parent] = useAutoAnimate();
  const TRPCContext = api.useContext();

  useEffect(() => {
    const channel = pusher.subscribe("twitter-clone");
    channel.bind(
      "followChange",
      async (data: { followerId: string; followingId: string }) => {
        if (data.followerId === userId) {
          await TRPCContext.follow.getFollowing.invalidate();
        }
      }
    );
    return () => {
      pusher.unsubscribe("twitter-clone");
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onScroll = async (e: Event) => {
      if (e.target) {
        const doc = e.target as Document;
        if (doc.scrollingElement) {
          const { scrollHeight, scrollTop, clientHeight } =
            doc.scrollingElement;
          if (scrollHeight - scrollTop <= clientHeight * 1.5) {
            !following?.isFetchingNextPage &&
              following?.hasNextPage &&
              (await following?.fetchNextPage());
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
  }, [following]);

  return (
    <ProtectedRoute>
      <Head>
        <title>Following</title>
      </Head>
      {following.isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <SyncLoader color="#f1f5f9" size={7} />
        </div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col md:mx-auto md:w-1/3">
          <button
            className="primary-btn mt-4 self-start px-2 py-1 capitalize text-slate-200 underline decoration-slate-200
                decoration-2 underline-offset-2
                hover:text-slate-300 hover:decoration-slate-300 focus:text-slate-300 focus:decoration-slate-300 focus:ring-2 focus:ring-slate-300 active:text-slate-400 active:decoration-slate-400 active:ring-2 active:ring-slate-400"
            onClick={() => router.back()}
          >
            Go Back
          </button>
          <h1 className="my-4 text-center text-xl font-bold">Following</h1>
          {following.data?.pages.every(
            (page) => page?.items && page.items.length > 0
          ) ? (
            <div className="flex flex-col gap-2" ref={parent}>
              {following.data?.pages.map((page) =>
                page?.items.map((follow) => (
                  <Link
                    href={`/user/${follow.following.id}`}
                    className="transition-no-outline flex items-center gap-3 rounded-md border-2 border-slate-700 p-2 duration-150 ease-out focus:border-slate-500 focus:outline-none"
                    key={follow.following.id}
                  >
                    {follow.following.image && (
                      <Image
                        src={follow.following.image}
                        alt={`${follow.following.name}'s Image`}
                        width={100}
                        height={100}
                        className="h-10 w-10 rounded-full object-cover object-center"
                      />
                    )}
                    <p className="font-bold">{follow.following.name}</p>
                  </Link>
                ))
              )}
              {following.isFetchingNextPage ? (
                <BeatLoader color="#f1f5f9" size={7} className="mx-auto mt-4" />
              ) : (
                <></>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p>There is No Following.</p>
            </div>
          )}
        </div>
      )}
    </ProtectedRoute>
  );
};

export default Following;
