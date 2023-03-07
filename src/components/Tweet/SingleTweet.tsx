import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/24/solid";
import type { Like, Tweet } from "@prisma/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { api } from "../../utils/api";

type Props = {
  tweet: Tweet & {
    user: {
      name: string | null;
      image: string | null;
    };
    likes: Like[];
    _count: {
      likes: number;
    };
  };
};

const SingleTweet: FC<Props> = ({ tweet }) => {
  const { data: session } = useSession();
  const TRPCContext = api.useContext();

  dayjs.extend(relativeTime);
  dayjs.extend(updateLocale);
  dayjs.updateLocale("en", {
    relativeTime: {
      future: "in %s",
      past: "%s ago",
      s: "a few secs",
      m: "a min",
      mm: "%d mins",
      h: "an hour",
      hh: "%d hrs",
      d: "a day",
      dd: "%d days",
      M: "a month",
      MM: "%d months",
      y: "a year",
      yy: "%d years",
    },
  });

  const likeTweet = api.like.likeTweet.useMutation();
  const disLikeTweet = api.like.deleteLike.useMutation();

  const handleLikeClick = () => {
    if (
      session?.user &&
      tweet.likes.find((like) => like.userId === session?.user.id)?.userId ===
        session.user.id
    ) {
      session?.user &&
        disLikeTweet.mutate(
          { tweetId: tweet.id, userId: session?.user.id },
          {
            onSuccess: () => {
              //eslint-disable-next-line @typescript-eslint/no-floating-promises
              TRPCContext.tweet.getTweets.invalidate();
            },
          }
        );
    } else {
      likeTweet.mutate(
        { tweetId: tweet.id },
        {
          onSuccess: () => {
            //eslint-disable-next-line @typescript-eslint/no-floating-promises
            TRPCContext.tweet.getTweets.invalidate();
          },
        }
      );
    }
  };

  return (
    <div className="flex w-full gap-2 rounded-md border-2 border-slate-700 p-2 ">
      {tweet.user.image && (
        <Link
          href={`/user/${tweet.userId}`}
          className=" h-min min-w-fit rounded-full focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-[3px] focus:ring-offset-slate-800"
        >
          <Image
            src={tweet.user.image}
            width={100}
            height={100}
            alt="User Image"
            className="h-10 w-10 rounded-full object-cover object-center"
          />
        </Link>
      )}
      <div className="flex flex-col gap-1">
        <p className="font-bold">
          <Link
            href={`/user/${tweet.userId}`}
            className="rounded-sm focus:underline focus:decoration-slate-200 focus:decoration-2 focus:underline-offset-[3px] focus:outline-none"
          >
            {tweet.user.name}
          </Link>{" "}
          <span className="text-[0.6rem] font-normal">
            . {dayjs(tweet.createdAt).fromNow(true)}
          </span>
        </p>
        <p className="break-all text-sm">{tweet.text}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLikeClick}
            className="rounded-sm focus:outline-none focus:ring-1 focus:ring-slate-200 focus:ring-offset-1 focus:ring-offset-slate-800"
          >
            {session?.user &&
            tweet.likes.find((like) => like.userId === session?.user.id)
              ?.userId === session.user.id ? (
              <SolidHeartIcon className="h-5 w-5" />
            ) : (
              <OutlineHeartIcon className="h-5 w-5" />
            )}
          </button>
          <p className="">{tweet._count.likes}</p>
        </div>
      </div>
    </div>
  );
};

export default SingleTweet;
