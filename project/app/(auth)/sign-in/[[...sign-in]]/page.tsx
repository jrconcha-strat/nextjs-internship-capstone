// TODO: Task 2.3 - Create sign-in and sign-up pages
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--background) px-4">
      <div className="w-full max-w-md">
        <SignIn />
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
