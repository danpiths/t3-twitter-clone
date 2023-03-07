import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "../utils/api";

import "../styles/globals.css";
import Navbar from "../components/Navigation/Navbar";
import Footer from "../components/Navigation/Footer";
import Head from "next/head";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <Head>
        <title>Twitter Clone</title>
        <meta
          name="google-site-verification"
          content="9YZFz6ZHOOlhgf6U-MHGFxCFEF-LfaQowRgqnMJRZog"
        />
        <meta
          name="description"
          content="A clone of Twitter created using T3 Stack"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SessionProvider session={session}>
        <main className="patterned-bg flex min-h-screen flex-col justify-between bg-slate-800 text-slate-100">
          <Navbar />
          <div className="flex flex-1 flex-col overflow-hidden px-5">
            <Component {...pageProps} />
          </div>
          <Footer />
        </main>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
