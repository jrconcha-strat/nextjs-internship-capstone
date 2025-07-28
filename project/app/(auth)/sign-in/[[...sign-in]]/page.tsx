// TODO: Task 2.3 - Create sign-in and sign-up pages
"use client";
import { SignIn, useUser } from "@clerk/nextjs";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) {
    return (
      <div className="w-full h-screen flex justify-center items-center gap-2">
        <Loader2Icon size={24} className="animate-spin" />
        <p className="text-2xl">Loading</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--background) px-4">
      <div className="w-full max-w-md">
        <SignIn/>
      </div>
    </div>
  );
}

/*
TODO: Task 2.3 Implementation Notes:
- Import SignIn from @clerk/nextjs
- Configure sign-in redirects
- Style to match design system
- Add proper error handling
*/
