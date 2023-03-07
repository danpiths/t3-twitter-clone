import type { Dispatch, FC, SetStateAction } from "react";

type Props = {
  label: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
};

const TextInput: FC<Props> = ({ label, value, setValue }) => {
  return (
    <div className="relative mt-7">
      <input
        type="text"
        id={label}
        className="peer w-full rounded-md border-[3px] border-slate-100 bg-slate-100 px-4 py-2 text-slate-800 placeholder-transparent transition-colors focus:box-border focus:border-slate-400 focus:outline-none"
        placeholder={label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <label
        htmlFor={label}
        className="absolute left-4 -top-6 text-sm font-semibold text-slate-100 transition-all duration-200 ease-out peer-placeholder-shown:top-[0.7rem] peer-placeholder-shown:left-5 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-placeholder-shown:text-slate-400"
      >
        {label}
      </label>
    </div>
  );
};

export default TextInput;
