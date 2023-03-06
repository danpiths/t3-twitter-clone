import { FC, FormEvent, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";

const SearchBar: FC = () => {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearch("");
    router.push(`/search?userName=${search}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-6 w-6 -translate-y-1/2" />
      <input
        type="text"
        value={search}
        className="transition-no-outline w-full rounded-md border-2 border-slate-700 bg-slate-800 py-2 pr-2 pl-12 duration-150 ease-out focus:border-slate-500 focus:outline-none"
        placeholder="Search Users"
        onChange={(e) => setSearch(e.target.value)}
      />
    </form>
  );
};

export default SearchBar;
