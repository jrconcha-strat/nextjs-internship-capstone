"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Here, log the error to an error reporting service, which is tentative, for Phase 8
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col justify-center items-center h-screen w-[100vw]">
      <h1 className="text-dark-grey-400 font-bold text-4xl"> Oops! </h1>
      <div className="mt-4 text-center">
        <p className="text-dark-grey-100">
          Something went wrong while loading this page.
        </p>
        <p className="text-dark-grey-100">
          Please refresh the page or try again later.
        </p>
      </div>
    </div>
  );
}
