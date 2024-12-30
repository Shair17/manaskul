import { MainNav } from "@/components/MainNav";
import { UserNav } from "@/components/UserNav";
import Link from "next/link";
import { SchoolIcon } from "lucide-react";
import { getServerAuthSession } from "@/server/auth";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 border-b bg-background">
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="flex text-lg font-medium">
            <SchoolIcon className="mr-2 h-6 w-6" />
            <span className="hidden md:block">Académico</span>
          </Link>

          <MainNav session={session} className="mx-6" />

          <div className="ml-auto flex items-center space-x-4">
            <UserNav session={session} />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>
    </div>
  );
}
