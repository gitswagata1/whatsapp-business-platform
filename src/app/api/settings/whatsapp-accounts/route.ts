import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.whatsAppAccount.findMany({
    where: { organizationId: session.organizationId },
    select: {
      id: true,
      phoneNumber: true,
      phoneNumberId: true,
      wabaId: true,
      businessName: true,
      isActive: true,
      qualityRating: true,
      createdAt: true,
    },
  });

  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { phoneNumber, phoneNumberId, wabaId, accessToken, businessName } =
    await req.json();

  const account = await prisma.whatsAppAccount.create({
    data: {
      phoneNumber,
      phoneNumberId,
      wabaId,
      accessToken,
      businessName,
      organizationId: session.organizationId,
    },
  });

  return NextResponse.json(account);
}
