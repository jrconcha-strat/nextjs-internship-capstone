// TODO: Task 2.3 - Create sign-in and sign-up pages
import { SignUp } from "@clerk/nextjs";
export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--background) px-4">
      <div className="w-full max-w-md">
        <SignUp></SignUp>
      </div>
    </div>
  );
}

/*
TODO: Task 2.3 Implementation Notes:
- Import SignUp from @clerk/nextjs
- Configure sign-up redirects
- Style to match design system
- Add proper error handling
- Set up webhook for user data sync (Task 2.5)
*/
