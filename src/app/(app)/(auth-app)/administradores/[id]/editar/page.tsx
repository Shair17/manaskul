import { api } from "@/trpc/server";
import { EditAdminForm } from "./EditAdminForm";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { Role } from "@prisma/client";

interface Props {
  params: { id: string };
}

export default async function EditAdminPage(props: Props) {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) {
    return redirect("/administradores");
  }

  if (session.user.role !== Role.Admin) {
    return redirect("/administradores");
  }

  const adminId = props.params.id;

  const admin = await api.admin
    .getAdminById({ id: adminId })
    .catch(() => redirect("/administradores"));

  return <EditAdminForm admin={admin} />;
}
