import Head from "next/head";
import { FC, FormEvent, useEffect, useRef, useState } from "react";
import { BeatLoader } from "react-spinners";
import { api } from "../../utils/api";

const TweetForm: FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const createTweet = api.tweet.create.useMutation();
  const TRPCContext = api.useContext();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = (e: FormEvent<HTMLFormElement> | void) => {
    if (e) {
      e.preventDefault();
    }
    if (text.length < 5) {
      setError("Tweet needs to be at least 5 characters");
      return;
    }
    createTweet.mutate(
      { text },
      {
        onSuccess: () => {
          TRPCContext.tweet.getTweets.invalidate();
          setText("");
        },
      }
    );
  };

  useEffect(() => {
    if (error && text.length >= 5) {
      setError("");
    }
  }, [text]);

  return (
    <form
      className="transition-no-outline flex w-full flex-col self-start rounded-md border-2 border-slate-700 bg-slate-800 py-2 duration-150 ease-out focus-within:border-slate-500"
      onSubmit={handleSubmit}
      ref={formRef}
    >
      {createTweet.isLoading ? (
        <>
          <Head>
            <title>Tweeting...</title>
          </Head>
          <div className="my-[0.53125rem] flex flex-1 flex-col items-center justify-center">
            <BeatLoader color="#f1f5f9" size={7} />
            <p className="mt-1">Tweeting...</p>
          </div>
        </>
      ) : (
        <textarea
          className="h-14 w-full resize-none rounded-md bg-slate-800 px-2 text-slate-100 focus:outline-none"
          cols={30}
          ref={textAreaRef}
          rows={3}
          placeholder="Write a tweet..."
          value={text}
          onChange={(e) => setText(e.target.value.replace("\n", ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
        />
      )}
      <button
        className="primary-btn mx-2 mt-3 bg-blue-400 hover:bg-blue-500 focus:bg-blue-500 focus:ring-blue-500 active:bg-blue-700 active:ring-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        type="submit"
        disabled={createTweet.isLoading}
      >
        Tweet
      </button>
      {error ? (
        <p className="mt-2 px-2 text-center text-sm text-rose-400">{error}</p>
      ) : (
        <></>
      )}
    </form>
  );
};

export default TweetForm;
