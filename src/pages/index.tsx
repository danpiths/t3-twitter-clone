import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import HomePage from "../components/Home/HomePage";
import TweetFeed from "../components/Home/TweetFeed";

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  return (
    <>
      {status !== "loading" && !session ? (
        <HomePage />
      ) : (
        <>
          <Head>
            <title>Your Feed</title>
          </Head>
          <TweetFeed />
        </>
      )}
    </>
  );
};

export default Home;
