import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agents = await prisma.aIAgent.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(agents);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, systemPrompt, knowledgeBase, model, temperature, maxTokens } =
    await req.json();

  const agent = await prisma.aIAgent.create({
    data: {
      name,
      description,
      systemPrompt,
      knowledgeBase,
      model: model || "claude-sonnet-4-20250514",
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 1024,
      organizationId: session.organizationId,
    },
  });

  return NextResponse.json(agent);
}
