import { signIn } from "next-auth/react";
import type { FC } from "react";
import tweetSample from "../../../public/tweetSample.svg";
import Image from "next/image";

const HomePage: FC = () => {
  const SampleImages = [];
  for (let i = 0; i < 4; i++) {
    SampleImages.push(
      <Image
        //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        src={tweetSample}
        alt="Sample Tweet Graphic"
        className="mt-5 w-full md:ml-auto md:w-6/12"
        key={i}
        priority={true}
      />
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col md:flex-row md:items-center md:justify-center">
      <div className="">
        <h1 className="mt-7 text-3xl font-bold md:text-5xl">
          Welcome to <br /> <span className="text-blue-400">Twitter</span>{" "}
          Clone!
        </h1>
        <p className="mt-2 text-sm md:text-lg">Tweet stuff and follow people</p>
        <button
          className="primary-btn mt-4 w-full bg-blue-400 hover:bg-blue-500 focus:bg-blue-500 focus:ring-blue-500 active:bg-blue-700 active:ring-blue-700 md:self-start"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={() => signIn()}
        >
          Login
        </button>
      </div>
      <div className="">{SampleImages}</div>
    </div>
  );
};

export default HomePage;
