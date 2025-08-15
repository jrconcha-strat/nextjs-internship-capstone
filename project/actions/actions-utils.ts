"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function checkAuthenticationStatus() {
  const user = await auth();
  if (!user.isAuthenticated) redirect("/sign-up");
}
