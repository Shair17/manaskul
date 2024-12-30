"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

export const ProfileCompleteValidator: React.FC = () => {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isAuthenticated = session.status === "authenticated";

    if (!isAuthenticated) return;

    const hasCompletedProfile =
      !!session.data.user.name && !!session.data.user.image;

    if (hasCompletedProfile) return;

    toast.info("Por favor completa tu perfil para poder continuar.");

    if (pathname === "/complete-profile") return;

    router.replace("/complete-profile");
  }, [session, router, pathname]);

  return null;
};
