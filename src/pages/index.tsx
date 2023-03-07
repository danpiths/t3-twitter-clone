import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { SyncLoader } from "react-spinners";
import HomePage from "../components/Home/HomePage";
import TweetFeed from "../components/Home/TweetFeed";

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  return (
    <>
      {status === "loading" ? (
        <div className="flex flex-1 items-center justify-center">
          <SyncLoader color="#f1f5f9" size={7} />
        </div>
      ) : session?.user ? (
        <TweetFeed />
      ) : (
        <HomePage />
      )}
    </>
  );
};

export default Home;
