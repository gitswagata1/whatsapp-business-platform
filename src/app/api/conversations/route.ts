import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const status = searchParams.get("status");
  const assignedTo = searchParams.get("assignedTo");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {
    organizationId: session.organizationId,
  };

  if (status && status !== "ALL") {
    where.status = status;
  }
  if (assignedTo === "me") {
    where.assignedToId = session.id;
  } else if (assignedTo === "unassigned") {
    where.assignedToId = null;
  }
  if (search) {
    where.contact = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search } },
      ],
    };
  }

  const conversations = await prisma.conversation.findMany({
    where,
    include: {
      contact: {
        include: {
          tags: { include: { tag: true } },
        },
      },
      assignedTo: {
        select: { id: true, name: true, avatar: true },
      },
      messages: {
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
    orderBy: { lastMessageAt: "desc" },
    take: 50,
  });

  return NextResponse.json(conversations);
}
