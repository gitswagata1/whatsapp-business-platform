import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.organizationId;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalConversations,
    activeConversations,
    totalMessages,
    totalContacts,
    recentMessages,
    conversationsByStatus,
    agentStats,
  ] = await Promise.all([
    prisma.conversation.count({ where: { organizationId: orgId } }),
    prisma.conversation.count({
      where: { organizationId: orgId, status: "OPEN" },
    }),
    prisma.message.count({
      where: { conversation: { organizationId: orgId } },
    }),
    prisma.contact.count({ where: { organizationId: orgId } }),
    prisma.message.findMany({
      where: {
        conversation: { organizationId: orgId },
        timestamp: { gte: thirtyDaysAgo },
      },
      select: { direction: true, timestamp: true },
      orderBy: { timestamp: "asc" },
    }),
    prisma.conversation.groupBy({
      by: ["status"],
      where: { organizationId: orgId },
      _count: true,
    }),
    prisma.user.findMany({
      where: { organizationId: orgId },
      select: {
        name: true,
        _count: { select: { assignedChats: true } },
      },
    }),
  ]);

  const messagesByDay: Record<string, { inbound: number; outbound: number }> = {};
  for (const msg of recentMessages) {
    const day = msg.timestamp.toISOString().split("T")[0];
    if (!messagesByDay[day]) messagesByDay[day] = { inbound: 0, outbound: 0 };
    if (msg.direction === "INBOUND") messagesByDay[day].inbound++;
    else messagesByDay[day].outbound++;
  }

  return NextResponse.json({
    totalConversations,
    activeConversations,
    totalMessages,
    totalContacts,
    avgResponseTime: 0,
    messagesByDay: Object.entries(messagesByDay).map(([date, counts]) => ({
      date,
      ...counts,
    })),
    conversationsByStatus: conversationsByStatus.map((s) => ({
      status: s.status,
      count: s._count,
    })),
    topAgents: agentStats.map((a) => ({
      name: a.name,
      conversations: a._count.assignedChats,
      avgResponseTime: 0,
    })),
  });
}
