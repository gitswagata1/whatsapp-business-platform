import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { conversationId, content, type = "text" } = await req.json();

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        contact: true,
        whatsappAccount: true,
      },
    });

    if (!conversation || conversation.organizationId !== session.organizationId) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const result = await sendWhatsAppMessage({
      phoneNumberId: conversation.whatsappAccount.phoneNumberId,
      accessToken: conversation.whatsappAccount.accessToken,
      to: conversation.contact.phoneNumber,
      type,
      text: content,
    });

    const waMessageId = result.messages?.[0]?.id;

    const message = await prisma.message.create({
      data: {
        waMessageId,
        type: "TEXT",
        content,
        direction: "OUTBOUND",
        status: "SENT",
        conversationId: conversation.id,
        senderId: session.id,
      },
      include: { sender: { select: { id: true, name: true } } },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
