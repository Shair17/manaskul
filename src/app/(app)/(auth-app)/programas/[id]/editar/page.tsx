import { getServerAuthSession } from "@/server/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { EditProgramForm } from "./EditProgramForm";
import { api } from "@/trpc/server";

interface Props {
  params: { id: string };
}

export default async function EditProgramPage({ params }: Props) {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    redirect("/");
  }

  if (session.user.role !== Role.Admin) {
    redirect("/");
  }

  const programId = params.id;

  const program = await api.program
    .getProgramById({ id: programId })
    .catch(() => redirect("/programas"));

  return <EditProgramForm program={program} />;
}
