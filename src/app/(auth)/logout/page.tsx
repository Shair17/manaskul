"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function LogoutPage() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.replace("/");
      return;
    }

    void signOut({ redirect: true, callbackUrl: "/" });
  }, [router, session]);

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-2">
      <div>
        <span className="animate-flash inline-block h-2 w-2 rounded-full bg-blue-400"></span>
        <span className="animate-flash ml-2 inline-block h-2 w-2 rounded-full bg-blue-400 [animation-delay:0.2s]"></span>
        <span className="animate-flash ml-2 inline-block h-2 w-2 rounded-full bg-blue-400 [animation-delay:0.4s]"></span>
      </div>
    </div>
  );
}
