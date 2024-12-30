import Link from "next/link";
import { buttonVariants } from "./ui/button";

export const AuthAdvice: React.FC = () => {
  return (
    <section className="flex flex-col items-center justify-center gap-4 p-8">
      <p className="text-lg text-gray-700">
        Por favor ingresa para poder continuar
      </p>
      <Link href="/auth" className={buttonVariants()}>
        Ingresar
      </Link>
    </section>
  );
};
