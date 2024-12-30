import { api } from "@/trpc/server";
import { AdminViewer } from "./AdminViewer";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { Role } from "@prisma/client";

interface Props {
  params: { id: string };
}

export default async function AdminPage(props: Props) {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    redirect("/administradores");
  }

  if (session.user.role !== Role.Admin) {
    redirect("/administradores");
  }

  const adminId = props.params.id;

  const admin = await api.admin
    .getAdminById({ id: adminId })
    .catch(() => redirect("/administradores"));

  return <AdminViewer admin={admin} />;
}
