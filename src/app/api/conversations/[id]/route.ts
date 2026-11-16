import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      contact: {
        include: {
          tags: { include: { tag: true } },
          customFields: { include: { field: true } },
        },
      },
      assignedTo: {
        select: { id: true, name: true, avatar: true },
      },
      messages: {
        orderBy: { timestamp: "asc" },
        include: {
          sender: { select: { id: true, name: true } },
        },
      },
      notes: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!conversation || conversation.organizationId !== session.organizationId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.conversation.update({
    where: { id },
    data: { unreadCount: 0 },
  });

  return NextResponse.json(conversation);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const conversation = await prisma.conversation.findUnique({
    where: { id },
  });

  if (!conversation || conversation.organizationId !== session.organizationId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if (body.status) updateData.status = body.status;
  if (body.assignedToId !== undefined) updateData.assignedToId = body.assignedToId;
  if (body.isAIHandled !== undefined) updateData.isAIHandled = body.isAIHandled;

  const updated = await prisma.conversation.update({
    where: { id },
    data: updateData,
    include: {
      contact: true,
      assignedTo: { select: { id: true, name: true, avatar: true } },
    },
  });

  return NextResponse.json(updated);
}
