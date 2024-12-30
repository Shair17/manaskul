import fs from "fs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: any) {
  const dir = params.dir.join("/");
  if (!dir) {
    return new NextResponse(null, { status: 500 });
  }

  // Prevent path traversal attacks
  if (dir.indexOf("..") >= 0) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    // Read and serve the file
    const data = fs.readFileSync("public/" + dir, { flag: "r" });

    return new NextResponse(data, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
