import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const report = await prisma.report.findUnique({ where: { id } });

    if (!report) {
      return NextResponse.json(
        { error: "Reporte no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Error al obtener el reporte" },
      { status: 500 },
    );
  }
}
