import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = await prisma.template.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, category, body, footer, language, headerType, headerContent, buttons } =
    await req.json();

  const template = await prisma.template.create({
    data: {
      name,
      category,
      body,
      footer,
      language: language || "en",
      headerType,
      headerContent,
      buttons,
      organizationId: session.organizationId,
    },
  });

  return NextResponse.json(template);
}
