import { XMarkIcon } from "@heroicons/react/24/solid";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { Dispatch, FC, SetStateAction } from "react";

const NavPanel: FC<{
  setIsPanelOpen: Dispatch<SetStateAction<boolean>>;
  links: string[];
}> = ({ setIsPanelOpen, links }) => {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="absolute right-0 z-[70] flex h-screen w-10/12 flex-col bg-slate-800 drop-shadow-md">
      <button
        className="my-3 ml-auto mr-3 rounded-[0.05rem] focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 focus:ring-offset-slate-800"
        onClick={() => setIsPanelOpen(false)}
      >
        <XMarkIcon className="h-7 w-7" />
      </button>
      <div className="flex h-full flex-col">
        {links.map((link, i) => (
          <Link
            key={i}
            href={link}
            className={`transition-no-outline py-3 text-center capitalize duration-150 ease-out focus:bg-slate-900/50 focus:outline-none ${
              router.pathname === link ? "bg-slate-900" : ""
            }`}
            onClick={() => setIsPanelOpen(false)}
          >
            {link === "/" ? "Home" : link.replace("/", "")}
          </Link>
        ))}
        {session?.user ? (
          <button
            className="primary-btn mx-4 mt-auto mb-4 bg-rose-400 hover:bg-rose-500 focus:bg-rose-500 focus:ring-rose-500 active:bg-rose-700 active:ring-rose-700"
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
  );
};

export default NavPanel;
