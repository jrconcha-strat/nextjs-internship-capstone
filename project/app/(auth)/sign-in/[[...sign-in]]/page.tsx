import LoadingUI from "@/components/ui/loading-ui";
import { SignIn, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--background) px-4">
      <div className="w-full max-w-md">
        <ClerkLoading>
          <LoadingUI/>
        </ClerkLoading>
        <ClerkLoaded>
          <SignIn />
        </ClerkLoaded>
      </div>
    </div>
  );
}
