import type { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import ProtectedRoute from "../../components/ProtectedRoute";
import defaultUserProfile from "../../../public/defaultUserProfile.svg";
import { api } from "../../utils/api";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { Dispatch, FC, SetStateAction } from "react";
import Link from "next/link";
import { SyncLoader, BeatLoader } from "react-spinners";
import Head from "next/head";
import { pusher } from "../../lib/Pusher";
import SingleTweet from "../../components/Tweet/SingleTweet";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const Dashboard: NextPage = () => {
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const { data: user, isLoading } = api.user.getSelf.useQuery();
  const [parent] = useAutoAnimate();
  const TRPCContext = api.useContext();
  const { data: session } = useSession();
  const tweets = api.tweet.getSingleUserTweets.useInfiniteQuery(
    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    { limit: 5, userId: session?.user.id },
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
    }
  );

  useEffect(() => {
    const channel = pusher.subscribe("twitter-clone");
    channel.bind(
      "followChange",
      async (data: { followerId: string; followingId: string }) => {
        if (
          data.followerId === session?.user.id ||
          data.followingId === session?.user.id
        ) {
          await TRPCContext.user.getSelf.invalidate();
        }
      }
    );
    channel.bind("tweetLikeChange", async (data: { tweetId: string }) => {
      if (
        tweets?.data?.pages
          .map((page) => {
            const temp = page?.items.filter(
              (tweet) => tweet.id === data.tweetId
            );
            return temp?.length && temp.length > 0;
          })
          .includes(true)
      ) {
        await TRPCContext.tweet.getSingleUserTweets.invalidate();
      }
    });
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
            !tweets?.isFetchingNextPage &&
              tweets?.hasNextPage &&
              (await tweets?.fetchNextPage());
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

  return (
    <ProtectedRoute>
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <SyncLoader color="#f1f5f9" size={7} />
        </div>
      ) : (
        <>
          <Head>
            <title>Dashboard</title>
          </Head>
          {isDeleteUserModalOpen ? (
            <DeleteUserModal
              setIsDeleteUserModalOpen={setIsDeleteUserModalOpen}
            />
          ) : (
            <></>
          )}
          <div className="mt-5 flex flex-1 flex-col md:mx-auto md:w-1/3 md:justify-center">
            <div className="flex items-center gap-3">
              <Image
                //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                src={user?.image ? user.image : defaultUserProfile}
                alt={`${user?.name ? user.name : "null"}'s Image`}
                width={100}
                height={100}
                className="h-16 w-16 rounded-full object-cover object-center"
              />
              <div className="md:w-full">
                <p className="text-lg font-bold">{user?.name}</p>
                <p className="w-11/12 break-all text-xs">{user?.email}</p>
              </div>
            </div>
            <div className="mt-7 flex justify-between">
              <div>
                <p className="font-bold">Tweets</p>
                <p className="text-center">{user?._count.tweets}</p>
              </div>
              {session?.user.id ? (
                <>
                  <Link href={`/followers/${session.user.id}`}>
                    <p className="font-bold">Followers</p>
                    <p className="text-center">{user?._count.followers}</p>
                  </Link>
                  <Link href={`/following/${session.user.id}`}>
                    <p className="font-bold">Following</p>
                    <p className="text-center">{user?._count.following}</p>
                  </Link>
                </>
              ) : (
                <></>
              )}
            </div>
            <div className="my-5 flex flex-col gap-3">
              <Link
                href="/editProfile"
                className="primary-btn bg-blue-400 text-center hover:bg-blue-500 focus:bg-blue-500 focus:ring-blue-500 active:bg-blue-700 active:ring-blue-700"
              >
                Edit Profile
              </Link>
              <button
                className="primary-btn bg-rose-400 hover:bg-rose-500 focus:bg-rose-500 focus:ring-rose-500 active:bg-rose-700 active:ring-rose-700"
                //eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </button>
              <button
                className="primary-btn mb-2 bg-red-500 hover:bg-red-600 focus:bg-red-600 focus:ring-red-600 active:bg-red-800 active:ring-red-800"
                onClick={() => setIsDeleteUserModalOpen(true)}
              >
                Delete Profile
              </button>
            </div>
            <div className="mb-5 flex flex-1 flex-col">
              {tweets?.isLoading ? (
                <div className="flex flex-1 items-center justify-center">
                  <SyncLoader color="#f1f5f9" size={7} />
                </div>
              ) : tweets?.data?.pages.every(
                  (page) => page?.items && page.items.length > 0
                ) ? (
                <div className="flex w-full flex-col gap-3" ref={parent}>
                  {tweets?.data.pages.map((page) =>
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
                  <p className="font-bold">There are no tweets by you :(</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </ProtectedRoute>
  );
};

const DeleteUserModal: FC<{
  setIsDeleteUserModalOpen: Dispatch<SetStateAction<boolean>>;
}> = ({ setIsDeleteUserModalOpen }) => {
  const deleteUser = api.user.delete.useMutation();
  const router = useRouter();

  return (
    <div className="absolute top-0 left-0 z-[100] flex h-screen w-full flex-col items-center justify-center bg-black/40">
      <div className="mx-7 flex flex-col rounded-md bg-slate-100 p-5 text-slate-800 md:w-1/3">
        {deleteUser.isLoading ? (
          <>
            <Head>
              <title>Bye :(</title>
            </Head>
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <BeatLoader color="#1e293b" size={7} />
              <p>Deleteing Account...</p>
            </div>
          </>
        ) : deleteUser.isSuccess ? (
          <p className="font-bold">Account Deleted</p>
        ) : (
          <>
            <p className="font-bold">
              Are you sure you want to delete your account?
            </p>
            <p className="mt-1 text-xs">
              You won&apos;t be able to recover any data after you&apos;ve
              deleted your account.
            </p>
            <div className="flex items-center gap-2">
              <button
                className="primary-btn mt-4 flex-1 bg-rose-400 text-slate-100 ring-offset-slate-100 hover:bg-rose-500 focus:bg-rose-500 focus:ring-rose-500 active:bg-rose-700 active:ring-rose-700"
                onClick={() => {
                  deleteUser.mutate(undefined, {
                    //eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onSuccess: async () => {
                      await signOut({ callbackUrl: "/" });
                      // eslint-disable-next-line @typescript-eslint/no-floating-promises
                      router.push("/");
                    },
                  });
                }}
              >
                Yes
              </button>
              <button
                className="primary-btn mt-4 flex-1 text-slate-700 hover:text-slate-800 hover:underline hover:decoration-slate-800 hover:decoration-2 hover:underline-offset-2
                focus:text-slate-800 focus:underline focus:decoration-slate-800 focus:decoration-2 focus:underline-offset-2 focus:ring-1
                focus:ring-slate-800 active:text-slate-900 active:underline active:decoration-slate-900 active:decoration-2 active:underline-offset-2 active:ring-1 active:ring-slate-900"
                onClick={() => setIsDeleteUserModalOpen(false)}
              >
                No
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
