import { CourseMode, Role } from "@prisma/client";

export const parseCourseMode = (courseMode: keyof typeof CourseMode) => {
  switch (courseMode) {
    case CourseMode.Hybrid:
      return "Híbridas";

    case CourseMode.OnSite:
      return "Presenciales";

    case CourseMode.Online:
      return "Virtuales";

    default:
      return "Desconocido";
  }
};

export const parseRole = (role: keyof typeof Role) => {
  switch (role) {
    case Role.Admin:
      return "Administrador";

    case Role.Instructor:
      return "Docente";

    case Role.Student:
      return "Estudiante";

    default:
      return "Desconocido";
  }
};

export const parseSizeToText = (
  size: number,
  singular: string,
  plural: string,
) => {
  return size === 1 ? singular : plural;
};
