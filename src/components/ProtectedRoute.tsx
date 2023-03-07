import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import type { FC, PropsWithChildren } from "react";
import { SyncLoader } from "react-spinners";
import { api } from "../utils/api";

const ProtectedRoute: FC<PropsWithChildren> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isLoading } = api.user.getSelf.useQuery();

  if (!session && status !== "loading") {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.push("/");
  }

  return (
    <>
      {session ? (
        children
      ) : status === "loading" || isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <SyncLoader color="#f1f5f9" size={7} />
        </div>
      ) : (
        <div>Protected Route</div>
      )}
    </>
  );
};

export default ProtectedRoute;
