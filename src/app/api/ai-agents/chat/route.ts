import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, agentId } = await req.json();

  const [conversation, agent] = await Promise.all([
    prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { timestamp: "asc" },
          take: 20,
        },
        contact: true,
      },
    }),
    prisma.aIAgent.findUnique({ where: { id: agentId } }),
  ]);

  if (!conversation || !agent) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const systemPrompt = [
    agent.systemPrompt || "You are a helpful customer support assistant.",
    agent.knowledgeBase ? `\nKnowledge Base:\n${agent.knowledgeBase}` : "",
    `\nCustomer: ${conversation.contact.name || conversation.contact.phoneNumber}`,
    "\nRespond concisely and helpfully. Keep responses under 500 characters for WhatsApp.",
  ].join("");

  const messages = conversation.messages.map((msg) => ({
    role: (msg.direction === "INBOUND" ? "user" : "assistant") as "user" | "assistant",
    content: msg.content,
  }));

  const response = await anthropic.messages.create({
    model: agent.model,
    max_tokens: agent.maxTokens,
    system: systemPrompt,
    messages,
  });

  const aiReply =
    response.content[0].type === "text" ? response.content[0].text : "";

  return NextResponse.json({ reply: aiReply });
}
