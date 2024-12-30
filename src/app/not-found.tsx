import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto my-auto flex h-full max-w-7xl items-center px-6 lg:px-8">
      <div className="mx-auto max-w-2xl lg:max-w-none">
        <div className="flex max-w-xl flex-col items-center text-center">
          <p className="font-display text-4xl font-semibold sm:text-5xl">404</p>
          <h1 className="font-display text-fg-muted-inverse mt-4 text-2xl font-semibold">
            Página no encontrada
          </h1>
          <p className="text-fg-muted mt-2 text-sm">
            Lo sentimos, no pudimos encontrar la página que estás buscando.
          </p>
          <Link
            className="bg-bg-primary text-fg-onPrimary ring-border-focus hover:bg-bg-primary-hover focus-visible:ring-offset-bg pressed:bg-bg-primary-active disabled:bg-bg-disabled disabled:text-fg-disabled mt-4 inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 text-sm font-medium outline-none ring-0 ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-default [&_svg]:size-4"
            href="/"
          >
            <ChevronLeft />
            <span className="truncate">Ir al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
