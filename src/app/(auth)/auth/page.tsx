import { Metadata } from "next";
import Link from "next/link";
import { SchoolIcon } from "lucide-react";
import { UserAuthForm } from "@/components/UserAuthForm";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
};

export default function AuthPage() {
  return (
    <div className="container relative flex h-dvh flex-col items-center justify-center px-4 md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-blue-900" />
        <div className="relative z-20 flex items-center">
          <Link href="/" className="flex text-lg font-medium">
            <SchoolIcon className="mr-2 h-6 w-6" />
            Académico
          </Link>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Ingresa a tu cuenta
            </h1>
            <p className="text-sm text-muted-foreground">
              Ingresa tu correo electrónico para ingresar a tu cuenta
            </p>
          </div>
          <UserAuthForm />
        </div>
      </div>
    </div>
  );
}
