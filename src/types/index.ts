export type ConversationWithDetails = {
  id: string;
  status: "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
  lastMessageAt: string | null;
  unreadCount: number;
  isAIHandled: boolean;
  contact: {
    id: string;
    name: string | null;
    phoneNumber: string;
    avatar: string | null;
    tags: { tag: { id: string; name: string; color: string } }[];
  };
  assignedTo: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
  messages: MessageData[];
  notes: NoteData[];
};

export type MessageData = {
  id: string;
  type: string;
  content: string;
  mediaUrl: string | null;
  direction: "INBOUND" | "OUTBOUND";
  status: "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";
  timestamp: string;
  isAIGenerated: boolean;
  sender: {
    id: string;
    name: string;
  } | null;
};

export type NoteData = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
};

export type ContactData = {
  id: string;
  phoneNumber: string;
  name: string | null;
  email: string | null;
  source: string | null;
  isOptedIn: boolean;
  createdAt: string;
  tags: { tag: { id: string; name: string; color: string } }[];
  customFields: { field: { id: string; name: string }; value: string }[];
  _count?: { conversations: number };
};

export type BroadcastData = {
  id: string;
  name: string;
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  scheduledAt: string | null;
  sentAt: string | null;
  totalRecipients: number;
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  failed: number;
  createdAt: string;
  template: {
    id: string;
    name: string;
    body: string;
  };
  createdBy: {
    name: string;
  };
};

export type AnalyticsData = {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  totalContacts: number;
  avgResponseTime: number;
  messagesByDay: { date: string; inbound: number; outbound: number }[];
  conversationsByStatus: { status: string; count: number }[];
  topAgents: { name: string; conversations: number; avgResponseTime: number }[];
};

export type AIAgentData = {
  id: string;
  name: string;
  description: string | null;
  systemPrompt: string | null;
  knowledgeBase: string | null;
  isActive: boolean;
  model: string;
  temperature: number;
  maxTokens: number;
  createdAt: string;
};
