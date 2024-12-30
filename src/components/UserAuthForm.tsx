"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LoaderIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useLoginForm } from "@/shared/forms/login.form";
import { useRouter } from "next/navigation";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { register, handleSubmit, formState } = useLoginForm();
  const router = useRouter();

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);

      const signInResult = await signIn("email", {
        email: data.email.toLowerCase().trim(),
        redirect: false,
        callbackUrl: "/",
      });

      if (!signInResult?.ok) {
        toast.error("Algo salió mal, intenta de nuevo por favor.");
        return;
      }

      toast.success(
        "Verifica tu correo, te enviamos un enlace de inicio de sesión. Asegúrate de verificar tu bandeja de spam también.",
      );
      router.push("/");
    } catch (error) {
      console.log(error);
      toast.error("Ocurrió un error al ingresar a tu cuenta.");
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="nombre@ejemplo.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...register("email", { required: true })}
            />

            {formState.errors.email?.message ? (
              <span className="text-fg-danger text-xs">
                {formState.errors.email?.message}
              </span>
            ) : null}
          </div>
          <Button disabled={isLoading}>
            {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
            Continuar con Correo
          </Button>
        </div>
      </form>
    </div>
  );
}
