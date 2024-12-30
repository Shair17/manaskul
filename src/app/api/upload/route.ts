import path from "path";
import { promises as fs } from "fs";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, fileName } = await req.json();

    const matches = imageBase64.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      return NextResponse.json(
        { error: "Base64 string inválido" },
        { status: 400 },
      );
    }

    const fileType = matches[1];
    const base64Data = matches[2];

    const outputDir = path.join(process.cwd(), "public", "uploads");
    const outputPath = path.join(outputDir, `${fileName}.${fileType}`);

    await fs.mkdir(outputDir, { recursive: true });

    const buffer = Buffer.from(base64Data, "base64");
    await fs.writeFile(outputPath, buffer);

    return NextResponse.json({
      success: true,
      filePath: `/uploads/${fileName}.${fileType}`,
    });
  } catch (error) {
    console.error("Error al guardar el archivo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
