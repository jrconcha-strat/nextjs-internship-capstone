import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="border-b border-french_gray-300 dark:border-payne's_gray-400 bg-white/80 dark:bg-outer_space-500/80 backdrop-blur-xs">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="text-2xl font-bold text-blue_munsell-500">
            Remotive
          </div>
          <div className="flex items-center space-x-4">
            <SignedIn>
            <Link
              href="/dashboard"
              className="text-outer_space-500 dark:text-platinum-500 hover:text-blue_munsell-500"
            >
              Dashboard
            </Link>
            <Link
              href="/projects"
              className="text-outer_space-500 dark:text-platinum-500 hover:text-blue_munsell-500"
            >
              Projects
            </Link>
            </SignedIn>
            <ThemeToggle />
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="text-outer_space-500 dark:text-platinum-500 hover:text-blue_munsell-500"
              >
                Sign In
              </Link>

              <Link
                href="/sign-up"
                className="px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600"
              >
                Get Started
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}
