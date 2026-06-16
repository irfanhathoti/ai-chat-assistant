"use client";

/** Shimmer placeholders shown while a selected chat's messages load. */
export default function MessageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      {[0, 1, 2].map((i) => {
        const isUser = i % 2 === 1;
        return (
          <div
            key={i}
            className={`flex w-full gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
          >
            <div className="skeleton h-9 w-9 shrink-0 rounded-xl" />
            <div
              className={`flex max-w-[80%] flex-col gap-2 ${
                isUser ? "items-end" : "items-start"
              }`}
            >
              <div
                className="skeleton h-4 rounded-md"
                style={{ width: isUser ? "9rem" : "15rem" }}
              />
              {!isUser && <div className="skeleton h-4 w-56 rounded-md" />}
              <div
                className="skeleton h-4 rounded-md"
                style={{ width: isUser ? "6rem" : "11rem" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
