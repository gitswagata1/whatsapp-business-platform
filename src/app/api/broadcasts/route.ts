import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const broadcasts = await prisma.broadcast.findMany({
    where: { organizationId: session.organizationId },
    include: {
      template: { select: { id: true, name: true, body: true } },
      createdBy: { select: { name: true } },
      _count: { select: { recipients: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(broadcasts);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, templateId, whatsappAccountId, contactIds, scheduledAt } =
    await req.json();

  const broadcast = await prisma.broadcast.create({
    data: {
      name,
      templateId,
      whatsappAccountId,
      organizationId: session.organizationId,
      createdById: session.id,
      status: scheduledAt ? "SCHEDULED" : "DRAFT",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      totalRecipients: contactIds.length,
      recipients: {
        create: contactIds.map((contactId: string) => ({
          contactId,
        })),
      },
    },
    include: {
      template: { select: { id: true, name: true, body: true } },
      createdBy: { select: { name: true } },
    },
  });

  return NextResponse.json(broadcast);
}
