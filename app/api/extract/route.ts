import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdf = formData.get("pdf") as File;

    if (!pdf) {
      return NextResponse.json(
        { error: "PDF es obligatorio" },
        { status: 400 },
      );
    }

    const pdfBuffer = Buffer.from(await pdf.arrayBuffer());
    const pdfBase64 = pdfBuffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64,
              },
            },
            {
              text: `Analiza este documento PDF de un reporte SROI (Social Return on Investment) y extrae la siguiente información en formato JSON estricto. No incluyas explicaciones fuera del JSON.

{
  "title": "Título completo del reporte",
  "abstract": "Resumen corto de 2-3 frases para un listado de reportes",
  "summary": "Resumen largo y detallado (mínimo 3-4 párrafos extensos). Debe cubrir: contexto y antecedentes de la organización, descripción del programa/modelo evaluado, metodología SROI utilizada (tipo de análisis, periodo evaluado, ratio SROI obtenido y rango de sensibilidad), resultados clave desglosados por cada grupo de interés (stakeholders), y conclusiones sobre el impacto social generado. Escríbelo de forma narrativa y profesional, similar a un abstract académico extenso.",
  "area": "Área temática principal (una de: Educación, Salud, Medio ambiente, Empleo, Vivienda, Cultura, Deporte, Inclusión social, Cooperación internacional, Otro)",
  "country": "País donde se realizó el estudio",
  "publish_year": 2024,
  "accredited": true/false,
  "tags": ["etiqueta1", "etiqueta2", "etiqueta3"]
}

Notas:
- publish_year debe ser un número entero
- accredited: true si el reporte menciona alguna acreditación o certificación SROI, false en caso contrario
- tags: entre 3 y 8 palabras clave relevantes
- Si no puedes determinar algún campo, usa "" para strings, 0 para números, false para booleanos, y [] para arrays`,
            },
          ],
        },
      ],
    });

    const text = response.text?.trim();
    if (!text) {
      return NextResponse.json(
        { error: "No se pudo extraer información del PDF" },
        { status: 500 },
      );
    }

    // Extract JSON from the response (handle markdown code blocks)
    let jsonText = text;
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    const extracted = JSON.parse(jsonText);

    return NextResponse.json(extracted);
  } catch (error) {
    console.error("Error extracting from PDF:", error);
    return NextResponse.json(
      { error: "Error al procesar el PDF" },
      { status: 500 },
    );
  }
}
