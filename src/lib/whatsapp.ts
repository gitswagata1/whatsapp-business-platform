const GRAPH_API_URL = "https://graph.facebook.com/v21.0";

export async function sendWhatsAppMessage({
  phoneNumberId,
  accessToken,
  to,
  type = "text",
  text,
  templateName,
  templateLanguage = "en",
  templateComponents,
  mediaUrl,
}: {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  type?: "text" | "template" | "image" | "document" | "video" | "audio";
  text?: string;
  templateName?: string;
  templateLanguage?: string;
  templateComponents?: Record<string, unknown>[];
  mediaUrl?: string;
}) {
  let body: Record<string, unknown> = {
    messaging_product: "whatsapp",
    to,
  };

  switch (type) {
    case "text":
      body = { ...body, type: "text", text: { body: text } };
      break;
    case "template":
      body = {
        ...body,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLanguage },
          components: templateComponents,
        },
      };
      break;
    case "image":
      body = { ...body, type: "image", image: { link: mediaUrl } };
      break;
    case "document":
      body = { ...body, type: "document", document: { link: mediaUrl } };
      break;
    case "video":
      body = { ...body, type: "video", video: { link: mediaUrl } };
      break;
    case "audio":
      body = { ...body, type: "audio", audio: { link: mediaUrl } };
      break;
  }

  const response = await fetch(
    `${GRAPH_API_URL}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

export async function getMessageTemplates(wabaId: string, accessToken: string) {
  const response = await fetch(
    `${GRAPH_API_URL}/${wabaId}/message_templates`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch templates");
  return response.json();
}

export async function markMessageAsRead(
  phoneNumberId: string,
  accessToken: string,
  messageId: string
) {
  await fetch(`${GRAPH_API_URL}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    }),
  });
}

export function parseWebhookMessage(body: Record<string, unknown>) {
  const entry = (body.entry as Record<string, unknown>[])?.[0];
  if (!entry) return null;

  const changes = (entry.changes as Record<string, unknown>[])?.[0];
  if (!changes) return null;

  const value = changes.value as Record<string, unknown>;
  if (!value) return null;

  const messages = value.messages as Record<string, unknown>[];
  const statuses = value.statuses as Record<string, unknown>[];
  const metadata = value.metadata as Record<string, unknown>;
  const contacts = value.contacts as Record<string, unknown>[];

  if (messages && messages.length > 0) {
    const msg = messages[0];
    const contact = contacts?.[0];
    return {
      type: "message" as const,
      phoneNumberId: metadata?.phone_number_id as string,
      from: msg.from as string,
      messageId: msg.id as string,
      timestamp: msg.timestamp as string,
      messageType: msg.type as string,
      text: (msg.text as Record<string, unknown>)?.body as string | undefined,
      contactName: (contact?.profile as Record<string, unknown>)?.name as string | undefined,
      media: msg.image || msg.video || msg.audio || msg.document || null,
    };
  }

  if (statuses && statuses.length > 0) {
    const status = statuses[0];
    return {
      type: "status" as const,
      messageId: status.id as string,
      status: status.status as string,
      recipientId: status.recipient_id as string,
    };
  }

  return null;
}
