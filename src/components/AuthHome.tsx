"use client";

import { useGreeting } from "@/shared/hooks/useGreeting";
import { HomeAdminsSection } from "./HomeAdminsSection";

import { HomeProgramsSection } from "./HomeProgramsSection";
import { HomeCoursesSection } from "./HomeCoursesSection";
import { HomeTeachersSection } from "./HomeTeachersSection";
import { HomeStudentsSection } from "./HomeStudentsSection";

import { Role } from "@prisma/client";

import type { Session } from "next-auth";

interface Props {
  session: Session;
}

export const AuthHome: React.FC<Props> = ({ session }) => {
  const greeting = useGreeting();
  const isAdmin = session.user.role === Role.Admin;
  const isTeacher = session.user.role === Role.Instructor;
  const isStudent = session.user.role === Role.Student;

  return (
    <>
      <h1 className="text-xl">
        {greeting},{" "}
        <strong>
          {session.user.name ?? session.user.email ?? session.user.role}
        </strong>
      </h1>

      {isAdmin ? <HomeProgramsSection session={session} /> : null}

      <HomeCoursesSection session={session} />

      {isAdmin || isStudent ? <HomeTeachersSection session={session} /> : null}

      {isAdmin || isTeacher ? <HomeStudentsSection session={session} /> : null}

      {isAdmin ? <HomeAdminsSection session={session} /> : null}
    </>
  );
};
