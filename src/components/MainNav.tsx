"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

import type { Session } from "next-auth";

const NAV_ITEMS = [
  {
    href: "/programas",
    label: "Programas",
    roles: [Role.Admin],
  },
  {
    href: "/cursos",
    label: "Cursos",
    roles: [Role.Admin, Role.Instructor, Role.Student],
  },
  {
    href: "/notas",
    label: "Notas",
    roles: [Role.Student, Role.Instructor, Role.Admin],
  },
  {
    href: "/estudiantes",
    label: "Estudiantes",
    roles: [Role.Admin, Role.Instructor],
  },
  {
    href: "/docentes",
    label: "Docentes",
    roles: [Role.Admin],
  },
  {
    href: "/administradores",
    label: "Administradores",
    roles: [Role.Admin],
  },
];

interface Props extends React.HTMLAttributes<HTMLElement> {
  session: Session | null;
}

export function MainNav({ session, className, ...props }: Props) {
  const isAuthenticated = !!session;

  const pathname = usePathname();
  const userRole = session?.user.role;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-4 pt-4">
            {NAV_ITEMS.map((navItem) => {
              const shouldShowItem = navItem.roles.includes(userRole!);
              const isActive = pathname.startsWith(navItem.href);

              if (!shouldShowItem) return null;

              return (
                <Link
                  key={navItem.href}
                  href={navItem.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    !isActive ? "text-muted-foreground" : "text-primary",
                  )}
                >
                  {navItem.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <nav
        className={cn(
          "hidden items-center space-x-4 md:flex lg:space-x-6",
          className,
        )}
        {...props}
      >
        {NAV_ITEMS.map((navItem) => {
          const shouldShowItem = navItem.roles.includes(userRole!);
          const isActive = pathname.startsWith(navItem.href);

          if (!shouldShowItem) {
            return null;
          }

          return (
            <Link
              key={navItem.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                !isActive ? "text-muted-foreground" : "text-primary",
              )}
              href={navItem.href}
            >
              {navItem.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
