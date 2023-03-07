import type { FC } from "react";
import TweetForm from "../Tweet/TweetForm";
import ProtectedRoute from "../ProtectedRoute";
import UserFeed from "../Tweet/UserFeed";
import SearchBar from "../Navigation/SearchBar";
import Head from "next/head";

const TweetFeed: FC = () => {
  return (
    <ProtectedRoute>
      <Head>
        <title>Your Feed</title>
      </Head>
      <div className="mt-4 flex flex-1 flex-col items-center gap-3">
        <div className="w-full md:w-1/3">
          <SearchBar />
        </div>
        <div className="flex w-full flex-1 flex-col md:w-1/3">
          <TweetForm />
          <UserFeed />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TweetFeed;
