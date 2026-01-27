"use client";
import { useAuth } from "@/providers/authProvider";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";

export default function App() {
  const { user: clerkUser } = useUser();
  const user = useAuth(clerkUser?.id);
  console.log(user.user);
  return (
    <div>
      <div>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
