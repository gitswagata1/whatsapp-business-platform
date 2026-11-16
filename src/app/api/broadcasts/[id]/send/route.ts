import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const broadcast = await prisma.broadcast.findUnique({
    where: { id },
    include: {
      template: true,
      whatsappAccount: true,
      recipients: {
        include: { contact: true },
        where: { status: "PENDING" },
      },
    },
  });

  if (!broadcast || broadcast.organizationId !== session.organizationId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.broadcast.update({
    where: { id },
    data: { status: "SENDING", sentAt: new Date() },
  });

  let sent = 0;
  let failed = 0;

  for (const recipient of broadcast.recipients) {
    try {
      await sendWhatsAppMessage({
        phoneNumberId: broadcast.whatsappAccount.phoneNumberId,
        accessToken: broadcast.whatsappAccount.accessToken,
        to: recipient.contact.phoneNumber,
        type: "template",
        templateName: broadcast.template.name,
        templateLanguage: broadcast.template.language,
      });

      await prisma.broadcastRecipient.update({
        where: { id: recipient.id },
        data: { status: "SENT", sentAt: new Date() },
      });
      sent++;
    } catch {
      await prisma.broadcastRecipient.update({
        where: { id: recipient.id },
        data: { status: "FAILED", failReason: "API error" },
      });
      failed++;
    }
  }

  await prisma.broadcast.update({
    where: { id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      sent,
      failed,
    },
  });

  return NextResponse.json({ sent, failed });
}
