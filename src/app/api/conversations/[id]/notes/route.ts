import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { content } = await req.json();

  const note = await prisma.note.create({
    data: {
      content,
      conversationId: id,
      userId: session.id,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(note);
}
