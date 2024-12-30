import { getServerAuthSession } from "@/server/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { CreateProgramForm } from "./CreateProgramForm";

export default async function CreateProgramPage() {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    return redirect("/");
  }

  if (session.user.role !== Role.Admin) {
    return redirect("/");
  }

  return <CreateProgramForm />;
}
