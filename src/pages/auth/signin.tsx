import { GetServerSideProps } from "next";
import { BuiltInProviderType } from "next-auth/providers";
import {
  ClientSafeProvider,
  getProviders,
  LiteralUnion,
  signIn,
  useSession,
} from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import { SyncLoader } from "react-spinners";
import googleLogo from "../../../public/googleLogo.svg";

type Props = {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null;
};

const SignIn: FC<Props> = (props) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user && status === "authenticated") {
      router.push("/");
    }
  }, [session]);

  return status === "loading" || session?.user ? (
    <div className="flex flex-1 items-center justify-center">
      <SyncLoader color="#f1f5f9" size={7} />
    </div>
  ) : (
    <>
      <Head>
        <title>Sign In</title>
      </Head>
      <div className="flex flex-1 items-center justify-center">
        {props.providers &&
          Object.values(props.providers).map((provider) => (
            <div key={provider.name}>
              <button
                onClick={() =>
                  signIn(provider.id, {
                    callbackUrl: "/",
                  })
                }
                className="primary-btn flex items-center gap-3 bg-slate-100 capitalize text-slate-800 hover:bg-slate-300 focus:bg-slate-300 focus:ring-slate-300 active:bg-slate-400 active:ring-slate-400"
              >
                <Image src={googleLogo} alt="Google Logo" />
                <p>Sign in with {provider.name}</p>
              </button>
            </div>
          ))}
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const providers = await getProviders();
  return {
    props: { providers },
  };
};

export default SignIn;
