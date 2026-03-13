import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { type Prisma } from "@/app/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import {
  createReportSchema,
  reportFiltersSchema,
  parseAccreditation,
  parseBudgetRange,
} from "@/lib/validations/report";

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
    
    // Helper para convertir null a undefined (Zod espera undefined para opcionales)
    const getParam = (key: string) => {
      const value = searchParams.get(key);
      return value === null ? undefined : value;
    };
    
    const getNumericParam = (key: string) => {
      const value = searchParams.get(key);
      if (value === null) return undefined;
      const num = parseInt(value, 10);
      return isNaN(num) ? undefined : num;
    };
    
    // Validar parámetros de filtro
    const filters = reportFiltersSchema.safeParse({
      search: getParam("search"),
      accreditation: getParam("accreditation"),
      editors: getParam("editors"),
      organization: getParam("organization"),
      budget_range: getParam("budgetRange"),
      area: getParam("area"),
      country: getParam("country"),
      cursor: getParam("cursor"),
      limit: getNumericParam("limit"),
    });

    if (!filters.success) {
      return NextResponse.json(
        { error: "Parámetros de filtro inválidos", details: filters.error.issues },
        { status: 400 }
      );
    }

    const { data: params } = filters;
    const search = params.search || "";
    const cursor = params.cursor;
    const limit = Math.min(params.limit || DEFAULT_PAGE_SIZE, 100);

    const where: Prisma.ReportWhereInput = {};

    // Búsqueda por texto (title, abstract, tags)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { abstract: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    // Filtro por accreditation (enum)
    if (params.accreditation) {
      where.accreditation = parseAccreditation(params.accreditation) as any;
    }

    // Filtro por editors (búsqueda parcial)
    if (params.editors) {
      where.editors = { contains: params.editors, mode: "insensitive" };
    }

    // Filtro por organization (búsqueda parcial)
    if (params.organization) {
      where.organization = { contains: params.organization, mode: "insensitive" };
    }

    // Filtro por budget_range (enum)
    if (params.budget_range) {
      where.budget_range = parseBudgetRange(params.budget_range) as any;
    }

    // Filtros existentes
    if (params.area) {
      where.area = params.area;
    }

    if (params.country) {
      where.country = params.country;
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

    // Extraer campos del FormData
    const title = formData.get("title") as string;
    const abstract = formData.get("abstract") as string;
    const summary = formData.get("summary") as string;
    const area = formData.get("area") as string;
    const country = formData.get("country") as string;
    const publish_year = parseInt(formData.get("publish_year") as string);
    const tags = JSON.parse(formData.get("tags") as string) as string[];
    const pdf = formData.get("pdf") as File;
    const thumbnail = formData.get("thumbnail") as File;

    // Nuevos campos
    const accreditation = formData.get("accreditation") as string | null;
    const editors = formData.get("editors") as string | null;
    const organization = formData.get("organization") as string | null;
    const budgetRange = formData.get("budgetRange") as string | null;

    // Validar con Zod schema
    const validation = createReportSchema.safeParse({
      title,
      abstract,
      summary,
      area,
      country,
      publish_year,
      accreditation: accreditation || null,
      editors: editors || null,
      organization: organization || null,
      budget_range: budgetRange || null,
      tags,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

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

    // Convertir strings de enum a valores de Prisma
    const accreditationEnum = parseAccreditation(accreditation);
    const budgetRangeEnum = parseBudgetRange(budgetRange);

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
        // Nuevos campos
        accreditation: accreditationEnum,
        editors: editors || null,
        organization: organization || null,
        budget_range: budgetRangeEnum,
        tags,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : "";
    console.error("Error creating report:", message, stack);
    return NextResponse.json(
      { error: "Error al crear el informe", detail: message },
      { status: 500 },
    );
  }
}
