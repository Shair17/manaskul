import { api } from "@/trpc/server";
import { ProgramViewer } from "./ProgramViewer";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { Role } from "@prisma/client";

interface Props {
  params: { id: string };
  searchParams: { search?: string };
}

export default async function ProgramPage(props: Props) {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    redirect("/programas");
  }

  if (session.user.role !== Role.Admin) {
    redirect("/programas");
  }

  const programId = props.params.id;

  const program = await api.program
    .getProgramById({ id: programId })
    .catch(() => redirect("/programas"));

  return (
    <ProgramViewer
      program={program}
      session={session}
      searchParams={props.searchParams}
    />
  );
}
