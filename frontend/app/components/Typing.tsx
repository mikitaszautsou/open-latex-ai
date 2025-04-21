import clsx from "clsx";

export function Typing({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "relative w-15 min-h-8 px-1.5 py-1.5 ml-1.5 bg-[#e4e4ec] rounded-full animate-[typing] flex justify-center items-center",
        className
      )}
    >
      <div className="absolute w-5 h-5 bg-[#e4e4ec] left-[-3px] bottom-[-3px] rounded-full" />
      <div className="absolute w-2 h-2 bg-[#e4e4ec] left-[-8px] bottom-[-8px] rounded-full" />
      <div className="float-left w-2 h-2 min-w-2 min-h-2 mx-1 bg-gray-500 rounded-full animate-[loadingFade_0.8s_infinite]"></div>
      <div className="float-left w-2 h-2 min-w-2 min-h-2 mx-1 bg-gray-500 rounded-full animate-[loadingFade_0.8s_infinite] delay-75"></div>
      <div className="float-left w-2 h-2 min-w-2 min-h-2  mx-1 bg-gray-500 rounded-full animate-[loadingFade_0.8s_infinite] delay-150"></div>
    </div>
  );
}
