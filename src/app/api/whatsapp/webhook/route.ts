import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseWebhookMessage, markMessageAsRead } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = parseWebhookMessage(body);
    if (!parsed) return NextResponse.json({ status: "ok" });

    if (parsed.type === "message") {
      const account = await prisma.whatsAppAccount.findUnique({
        where: { phoneNumberId: parsed.phoneNumberId },
      });
      if (!account) return NextResponse.json({ status: "ok" });

      let contact = await prisma.contact.findUnique({
        where: {
          phoneNumber_organizationId: {
            phoneNumber: parsed.from,
            organizationId: account.organizationId,
          },
        },
      });

      if (!contact) {
        contact = await prisma.contact.create({
          data: {
            phoneNumber: parsed.from,
            name: parsed.contactName || null,
            organizationId: account.organizationId,
            source: "whatsapp",
          },
        });
      }

      let conversation = await prisma.conversation.findUnique({
        where: {
          contactId_whatsappAccountId: {
            contactId: contact.id,
            whatsappAccountId: account.id,
          },
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            contactId: contact.id,
            whatsappAccountId: account.id,
            organizationId: account.organizationId,
            status: "OPEN",
            lastMessageAt: new Date(),
          },
        });
      }

      await prisma.message.create({
        data: {
          waMessageId: parsed.messageId,
          type: parsed.messageType.toUpperCase() as "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT",
          content: parsed.text || `[${parsed.messageType}]`,
          direction: "INBOUND",
          status: "DELIVERED",
          conversationId: conversation.id,
          timestamp: new Date(parseInt(parsed.timestamp) * 1000),
        },
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          unreadCount: { increment: 1 },
          status: "OPEN",
        },
      });

      await markMessageAsRead(
        account.phoneNumberId,
        account.accessToken,
        parsed.messageId
      );
    }

    if (parsed.type === "status") {
      const statusMap: Record<string, string> = {
        sent: "SENT",
        delivered: "DELIVERED",
        read: "READ",
        failed: "FAILED",
      };
      const newStatus = statusMap[parsed.status];
      if (newStatus) {
        await prisma.message.updateMany({
          where: { waMessageId: parsed.messageId },
          data: { status: newStatus as "SENT" | "DELIVERED" | "READ" | "FAILED" },
        });
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ status: "ok" });
  }
}
