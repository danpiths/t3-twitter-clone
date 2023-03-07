import Image from "next/image";
import { useEffect, useState } from "react";
import type { FC } from "react";
import twitterLogo from "../../../public/twitterLogo.svg";
import { Bars3Icon } from "@heroicons/react/24/solid";
import Link from "next/link";
import NavPanel from "./NavPanel";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

const Navbar: FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [links, setLinks] = useState<string[]>([]);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    status !== "loading"
      ? session?.user
        ? setLinks(["/", "/dashboard"])
        : setLinks(["/"])
      : setLinks([]);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <>
      {isPanelOpen ? (
        <NavPanel setIsPanelOpen={setIsPanelOpen} links={links} />
      ) : (
        <></>
      )}
      <div className="sticky top-0 left-0 z-50 flex items-center justify-between bg-slate-800 p-5 drop-shadow-md md:py-2">
        <Link
          href="/"
          className="rounded-[0.05rem] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 md:py-3"
        >
          <Image
            //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            src={twitterLogo}
            alt="Twitter Icon"
            className="h-5 w-5"
            placeholder="blur"
            blurDataURL={"../../../public/twitterLogo.svg"}
          />
        </Link>
        <button
          className="rounded-[0.05rem] focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 focus:ring-offset-slate-800 md:hidden"
          onClick={() => {
            setIsPanelOpen(true);
          }}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <div className="hidden items-center gap-4 capitalize md:flex">
          {links.map((link, i) => (
            <Link
              key={i}
              href={link}
              className={`transition-no-outline py-3 text-center capitalize duration-150 ease-out focus:bg-slate-900/50 focus:outline-none md:hover:bg-slate-800 md:hover:underline md:hover:decoration-blue-500 md:hover:decoration-2 md:hover:underline-offset-[3px] md:focus:bg-slate-800 md:focus:underline md:focus:decoration-blue-500 md:focus:decoration-2 md:focus:underline-offset-[3px] md:active:bg-slate-800 md:active:underline md:active:decoration-blue-300 md:active:decoration-2 md:active:underline-offset-[3px] ${
                router.pathname === link
                  ? "bg-slate-900 md:bg-slate-800 md:underline md:decoration-blue-500 md:decoration-2 md:underline-offset-[3px]"
                  : ""
              }`}
            >
              {link === "/" ? "Home" : link.replace("/", "")}
            </Link>
          ))}
          {session?.user ? (
            <button
              className="primary-btn bg-rose-400 px-3 py-1 capitalize hover:bg-rose-500 focus:bg-rose-500 focus:ring-rose-500 active:bg-rose-700 active:ring-rose-700"
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Logout
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
