import LoadingUI from "@/components/ui/loading-ui";
import { SignUp, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md">
        <ClerkLoading>
          <LoadingUI/>
        </ClerkLoading>
        <ClerkLoaded>
          <SignUp />
        </ClerkLoaded>
      </div>
    </div>
  );
}
