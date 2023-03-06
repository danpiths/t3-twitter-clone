import { NextPage } from "next";
import { useRouter } from "next/router";
import { BeatLoader, SyncLoader } from "react-spinners";
import { api } from "../../utils/api";
import ProtectedRoute from "../../components/ProtectedRoute";
import Image from "next/image";
import SearchBar from "../../components/Navigation/SearchBar";
import Link from "next/link";
import { useEffect } from "react";
import Head from "next/head";

const SearchPage: NextPage = () => {
  const router = useRouter();
  const userName = router.query.userName as string;

  const users = api.user.searchUsers.useInfiniteQuery(
    { userName, limit: 5 },
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
    }
  );

  useEffect(() => {
    const onScroll = async (e: Event) => {
      if (e.target) {
        const doc = e.target as Document;
        if (doc.scrollingElement) {
          const { scrollHeight, scrollTop, clientHeight } =
            doc.scrollingElement;
          if (scrollHeight - scrollTop <= clientHeight * 1.5) {
            !users.isFetchingNextPage &&
              users.hasNextPage &&
              (await users.fetchNextPage());
          }
        }
      }
    };

    document.addEventListener("scroll", onScroll);
    return () => {
      document.removeEventListener("scroll", onScroll);
    };
  }, [users]);

  return (
    <>
      <Head>
        <title>Search</title>
      </Head>
      <ProtectedRoute>
        {users.isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <SyncLoader color="#f1f5f9" size={7} />
          </div>
        ) : (
          <div className="my-4 md:mx-auto md:w-1/3">
            <SearchBar />
            <h1 className="my-4 text-center text-xl">
              Search Results for <br />{" "}
              <span className="font-bold">'{userName}'</span>
            </h1>
            <div className="mt-2 flex flex-col gap-2">
              {users.data?.pages.map((page) =>
                page?.items.map((user) => (
                  <Link
                    href={`/user/${user.id}`}
                    className="transition-no-outline flex items-center gap-3 rounded-md border-2 border-slate-700 p-2 duration-150 ease-out focus:border-slate-500 focus:outline-none"
                    key={user.id}
                  >
                    {user.image && (
                      <Image
                        src={user.image}
                        alt={`${user.name}'s Image`}
                        width={100}
                        height={100}
                        className="h-10 w-10 rounded-full object-cover object-center"
                      />
                    )}
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-sm text-slate-400">
                        Followers: {user._count.followers}
                      </p>
                    </div>
                  </Link>
                ))
              )}
              {users.isFetchingNextPage ? (
                <BeatLoader color="#f1f5f9" size={7} className="mx-auto mt-4" />
              ) : (
                <></>
              )}
            </div>
          </div>
        )}
      </ProtectedRoute>
    </>
  );
};

export default SearchPage;
