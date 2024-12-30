import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import PDFDocument from "pdfkit";
import { TRPCError } from "@trpc/server";
import path from "path";
import fs from "fs";

export const reportRouter = createTRPCRouter({
  generateReportByEnrollment: protectedProcedure
    .input(
      z.object({
        enrollmentId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { enrollmentId } = input;

      const enrollment = await ctx.db.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          student: true,
          course: {
            include: {
              program: true,
              teacher: true,
            },
          },
          grades: true,
        },
      });

      if (!enrollment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No existe el estudiante en el curso.",
        });
      }

      // Crear un nuevo documento PDF
      const doc = new PDFDocument({
        margin: 50,
        font: "./public/assets/fonts/Roboto-Regular.ttf",
      });

      // Ruta para guardar el archivo
      const outputPath = path.join(process.cwd(), "public", "reports");
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      const fileName = `Reporte_Notas_${enrollment.student.name?.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
      const filePath = path.join(outputPath, fileName);

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.font(
        path.join(process.cwd(), "assets", "fonts", "Roboto-Regular.ttf"),
      );

      doc.fontSize(18).text(`Reporte de Notas: ${enrollment.student.name}`, {
        align: "center",
      });
      doc.moveDown(2);

      doc.fontSize(12).text(`Curso: ${enrollment.course.name}`);
      doc.text(`Programa: ${enrollment.course.program.name}`);
      doc.text(`Docente: ${enrollment.course.teacher.name}`);
      doc.moveDown(1);

      doc.fontSize(14).text("Detalles del Curso:", { underline: true });

      const tableTop = doc.y + 10;
      const tableLeft = 50;
      const columnWidths = [200, 100, 100, 100, 100];

      doc.fontSize(10);
      doc.text("Nombre del Curso", tableLeft, tableTop, {
        width: columnWidths[0],
        continued: true,
      });
      doc.text("Nota 1", tableLeft + columnWidths[0]!, tableTop, {
        width: columnWidths[1],
        continued: true,
      });
      doc.text(
        "Nota 2",
        tableLeft + columnWidths[0]! + columnWidths[1]!,
        tableTop,
        { width: columnWidths[2], continued: true },
      );
      doc.text(
        "Nota 3",
        tableLeft + columnWidths[0]! + columnWidths[1]! + columnWidths[2]!,
        tableTop,
        { width: columnWidths[3], continued: true },
      );
      doc.text(
        "Observación",
        tableLeft +
          columnWidths[0]! +
          columnWidths[1]! +
          columnWidths[2]! +
          columnWidths[3]!,
        tableTop,
      );

      const grades = enrollment.grades;
      const averageGrade =
        grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length;
      const observation = averageGrade >= 11 ? "Aprobado" : "Desaprobado";

      doc.text(enrollment.course.name, tableLeft, tableTop + 20, {
        width: columnWidths[0],
        continued: true,
      });
      grades.forEach((grade, index) => {
        doc.text(
          grade.score.toFixed(2),
          tableLeft + columnWidths[0]! + columnWidths[index]! * index,
          tableTop + 20,
          {
            width: columnWidths[index + 1],
            continued: true,
          },
        );
      });
      doc.text(
        observation,
        tableLeft +
          columnWidths[0]! +
          columnWidths[1]! +
          columnWidths[2]! +
          columnWidths[3]!,
        tableTop + 20,
      );

      doc.moveDown(2);
      doc
        .fontSize(12)
        .text(`Promedio Total: ${averageGrade.toFixed(2)}`, { align: "right" });

      doc.end();

      await new Promise<void>((resolve, reject) => {
        stream.on("finish", resolve);
        stream.on("error", reject);
      });

      return { filePath: `/reports/${fileName}` };
    }),
});
