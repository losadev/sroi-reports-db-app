import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { type Prisma } from "@/app/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFARE_S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.CLOUDFARE_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFARE_S3_SECRET_ACCESS_KEY_ID!,
  },
});

const BUCKET = process.env.CLOUDFARE_R2_BUCKET || "sroi-reports";
const R2_PUBLIC_URL = process.env.CLOUDFARE_R2_PUBLIC_URL || "";

const DEFAULT_PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const accredited = searchParams.get("accredited");
    const area = searchParams.get("area");
    const country = searchParams.get("country");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || `${DEFAULT_PAGE_SIZE}`),
      100,
    );

    const where: Prisma.ReportWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { abstract: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    if (accredited !== null && accredited !== undefined) {
      where.accredited = accredited === "true";
    }

    if (area) {
      where.area = area;
    }

    if (country) {
      where.country = country;
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    const hasMore = reports.length > limit;
    const data = hasMore ? reports.slice(0, limit) : reports;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return NextResponse.json({ data, nextCursor });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const abstract = formData.get("abstract") as string;
    const summary = formData.get("summary") as string;
    const area = formData.get("area") as string;
    const country = formData.get("country") as string;
    const publish_year = parseInt(formData.get("publish_year") as string);
    const accredited = formData.get("accredited") === "true";
    const tags = JSON.parse(formData.get("tags") as string) as string[];
    const pdf = formData.get("pdf") as File;
    const thumbnail = formData.get("thumbnail") as File;

    if (!pdf || !thumbnail) {
      return NextResponse.json(
        { error: "PDF y miniatura son obligatorios" },
        { status: 400 },
      );
    }

    // Upload PDF to R2
    const pdfKey = `reports/${crypto.randomUUID()}.pdf`;
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: pdfKey,
        Body: Buffer.from(await pdf.arrayBuffer()),
        ContentType: "application/pdf",
      }),
    );

    // Upload thumbnail to R2
    const ext = thumbnail.name.split(".").pop() || "jpg";
    const thumbKey = `thumbnails/${crypto.randomUUID()}.${ext}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: thumbKey,
        Body: Buffer.from(await thumbnail.arrayBuffer()),
        ContentType: thumbnail.type,
      }),
    );

    // Create report in DB
    const report = await prisma.report.create({
      data: {
        title,
        abstract,
        summary,
        file_url: `${R2_PUBLIC_URL}/${pdfKey}`,
        thumbnail_url: `${R2_PUBLIC_URL}/${thumbKey}`,
        area,
        country,
        publish_year,
        accredited,
        tags,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : "";
    console.error("Error creating report:", message, stack);
    return NextResponse.json(
      { error: "Error al crear el reporte", detail: message },
      { status: 500 },
    );
  }
}
