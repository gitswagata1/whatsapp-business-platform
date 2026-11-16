"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn, formatPhoneNumber, timeAgo, getInitials } from "@/lib/utils";
import { useStore } from "@/hooks/useStore";
import {
  Search,
  Send,
  Paperclip,
  Bot,
  Clock,
  CheckCheck,
  Check,
  X,
  StickyNote,
  UserPlus,
  CircleCheck,
  MessageSquare,
  Smile,
  Phone,
  Mail,
  Tag,
  MoreHorizontal,
  Zap,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Archive,
  Filter,
  User,
  ChevronDown,
  Hash,
  Star,
} from "lucide-react";

type Conversation = {
  id: string;
  status: string;
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
  assignedTo: { id: string; name: string } | null;
  messages: { id: string; content: string; direction: string; timestamp: string }[];
};

type Message = {
  id: string;
  type: string;
  content: string;
  direction: "INBOUND" | "OUTBOUND";
  status: string;
  timestamp: string;
  isAIGenerated: boolean;
  sender: { id: string; name: string } | null;
};

type Note = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
};

const QUICK_REPLIES = [
  { shortcut: "/hi", message: "Hello! Welcome to Acme Co. How can I help you today?" },
  { shortcut: "/thanks", message: "Thank you for choosing Acme Co! Is there anything else I can help you with?" },
  { shortcut: "/hours", message: "Our business hours are Mon-Fri 9AM-6PM, Sat 10AM-2PM. We're closed on Sundays." },
  { shortcut: "/wait", message: "Thank you for your patience. Let me check on that for you." },
  { shortcut: "/transfer", message: "Let me connect you with a specialist who can help you better." },
  { shortcut: "/price", message: "I'd be happy to help with pricing! Could you tell me which product you're interested in?" },
];

export default function InboxPage() {
  const { user } = useStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newNote, setNewNote] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [assignFilter, setAssignFilter] = useState("all");
  const [rightPanel, setRightPanel] = useState<"none" | "contact" | "notes">("none");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (assignFilter !== "all") params.set("assignedTo", assignFilter);
    if (search) params.set("search", search);
    const res = await fetch(`/api/conversations?${params}`);
    if (res.ok) setConversations(await res.json());
  }, [statusFilter, assignFilter, search]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedId) {
      fetch(`/api/conversations/${selectedId}`)
        .then((r) => r.json())
        .then((data) => {
          setMessages(data.messages || []);
          setNotes(data.notes || []);
        });
    }
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (newMessage.startsWith("/")) {
      setShowQuickReplies(true);
    } else {
      setShowQuickReplies(false);
    }
  }, [newMessage]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedId || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedId, content: newMessage }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setNewMessage("");
        fetchConversations();
      }
    } finally {
      setSending(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedId) return;
    const res = await fetch(`/api/conversations/${selectedId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newNote }),
    });
    if (res.ok) {
      const note = await res.json();
      setNotes((prev) => [note, ...prev]);
      setNewNote("");
    }
  };

  const updateConversation = async (data: Record<string, unknown>) => {
    if (!selectedId) return;
    await fetch(`/api/conversations/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchConversations();
  };

  const applyQuickReply = (message: string) => {
    setNewMessage(message);
    setShowQuickReplies(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SENT": return <Check size={14} className="text-gray-400" />;
      case "DELIVERED": return <CheckCheck size={14} className="text-gray-400" />;
      case "READ": return <CheckCheck size={14} className="text-blue-500" />;
      default: return <Clock size={14} className="text-gray-300" />;
    }
  };

  const selected = conversations.find((c) => c.id === selectedId);
  const filteredQuickReplies = QUICK_REPLIES.filter(
    (qr) => newMessage === "" || qr.shortcut.startsWith(newMessage)
  );

  return (
    <div className="h-screen flex">
      {/* Conversation List */}
      <div className="w-[340px] border-r border-gray-200 bg-white flex flex-col shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Inbox</h2>
            <div className="flex items-center gap-1">
              <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {conversations.filter((c) => c.unreadCount > 0).length} new
              </span>
            </div>
          </div>
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white border border-transparent focus:border-emerald-200 transition text-gray-900"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {["ALL", "OPEN", "PENDING", "RESOLVED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition whitespace-nowrap",
                  statusFilter === s
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
            <button
              onClick={() => setAssignFilter(assignFilter === "me" ? "all" : "me")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition whitespace-nowrap",
                assignFilter === "me"
                  ? "bg-violet-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              Mine
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 px-8">
              <MessageSquare size={40} className="mb-3 opacity-40" />
              <p className="text-sm text-center">No conversations yet</p>
              <p className="text-xs text-center mt-1 text-gray-300">Incoming WhatsApp messages will appear here</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => { setSelectedId(conv.id); setRightPanel("none"); }}
                className={cn(
                  "w-full px-4 py-3 flex items-start gap-3 transition border-l-2 text-left",
                  selectedId === conv.id
                    ? "bg-emerald-50/60 border-l-emerald-500"
                    : "border-l-transparent hover:bg-gray-50"
                )}
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-sm font-medium shrink-0">
                    {getInitials(conv.contact.name || conv.contact.phoneNumber)}
                  </div>
                  {conv.isAIHandled && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center ring-2 ring-white">
                      <Bot size={9} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-[13px] text-gray-900 truncate">
                      {conv.contact.name || formatPhoneNumber(conv.contact.phoneNumber)}
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                      {conv.lastMessageAt ? timeAgo(conv.lastMessageAt) : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <p className="text-xs text-gray-500 truncate pr-2">
                      {conv.messages[0]?.content || "No messages"}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  {conv.contact.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {conv.contact.tags.slice(0, 2).map((t) => (
                        <span
                          key={t.tag.id}
                          className="text-[9px] px-1.5 py-[1px] rounded-full font-medium"
                          style={{ backgroundColor: t.tag.color + "18", color: t.tag.color }}
                        >
                          {t.tag.name}
                        </span>
                      ))}
                      {conv.contact.tags.length > 2 && (
                        <span className="text-[9px] text-gray-400">+{conv.contact.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedId && selected ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="h-[60px] px-5 flex items-center justify-between border-b border-gray-200 bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-xs font-medium">
                {getInitials(selected.contact.name || selected.contact.phoneNumber)}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">
                  {selected.contact.name || formatPhoneNumber(selected.contact.phoneNumber)}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span>{formatPhoneNumber(selected.contact.phoneNumber)}</span>
                  {selected.assignedTo && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center gap-1">
                        <User size={10} /> {selected.assignedTo.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateConversation({ isAIHandled: !selected.isAIHandled })}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition",
                  selected.isAIHandled
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-500 hover:bg-purple-50 hover:text-purple-600"
                )}
                title="Toggle AI Agent"
              >
                <Bot size={14} />
                {selected.isAIHandled ? "AI On" : "AI Off"}
              </button>
              <button
                onClick={() => updateConversation({ assignedToId: user?.id })}
                className="p-2 hover:bg-gray-100 rounded-lg transition" title="Assign to me"
              >
                <UserPlus size={16} className="text-gray-500" />
              </button>
              <button
                onClick={() => updateConversation({ status: "RESOLVED" })}
                className="p-2 hover:bg-emerald-50 rounded-lg transition" title="Resolve"
              >
                <CircleCheck size={16} className="text-emerald-600" />
              </button>
              <button
                onClick={() => updateConversation({ status: "CLOSED" })}
                className="p-2 hover:bg-gray-100 rounded-lg transition" title="Close"
              >
                <Archive size={16} className="text-gray-500" />
              </button>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <button
                onClick={() => setRightPanel(rightPanel === "notes" ? "none" : "notes")}
                className={cn("p-2 rounded-lg transition", rightPanel === "notes" ? "bg-amber-100" : "hover:bg-gray-100")}
                title="Notes"
              >
                <StickyNote size={16} className={rightPanel === "notes" ? "text-amber-600" : "text-gray-500"} />
              </button>
              <button
                onClick={() => setRightPanel(rightPanel === "contact" ? "none" : "contact")}
                className={cn("p-2 rounded-lg transition", rightPanel === "contact" ? "bg-blue-100" : "hover:bg-gray-100")}
                title="Contact details"
              >
                <User size={16} className={rightPanel === "contact" ? "text-blue-600" : "text-gray-500"} />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 flex flex-col min-w-0">
              <div
                className="flex-1 overflow-y-auto p-5 space-y-2"
                style={{
                  backgroundColor: "#efeae2",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d5cec3' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              >
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="bg-white/80 rounded-xl px-6 py-3 shadow-sm">
                      <p className="text-xs text-gray-500">No messages in this conversation yet</p>
                    </div>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn("flex", msg.direction === "OUTBOUND" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[60%] px-3 py-2 rounded-xl shadow-sm relative group",
                        msg.direction === "OUTBOUND"
                          ? "bg-[#d9fdd3] rounded-tr-sm"
                          : "bg-white rounded-tl-sm"
                      )}
                    >
                      {msg.isAIGenerated && (
                        <div className="flex items-center gap-1 mb-0.5">
                          <Sparkles size={10} className="text-purple-500" />
                          <span className="text-[9px] text-purple-500 font-semibold">AI AGENT</span>
                        </div>
                      )}
                      {msg.sender && msg.direction === "OUTBOUND" && !msg.isAIGenerated && (
                        <p className="text-[10px] text-emerald-700 font-medium mb-0.5">{msg.sender.name}</p>
                      )}
                      <p className="text-[13px] text-gray-900 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span className="text-[10px] text-gray-500">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {msg.direction === "OUTBOUND" && getStatusIcon(msg.status)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies Popup */}
              {showQuickReplies && filteredQuickReplies.length > 0 && (
                <div className="bg-white border-t border-gray-200 px-4 py-2 max-h-40 overflow-y-auto">
                  <p className="text-[10px] text-gray-400 font-medium mb-1.5 uppercase">Quick Replies</p>
                  {filteredQuickReplies.map((qr) => (
                    <button
                      key={qr.shortcut}
                      onClick={() => applyQuickReply(qr.message)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 transition flex items-center gap-3"
                    >
                      <code className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">{qr.shortcut}</code>
                      <span className="text-xs text-gray-600 truncate">{qr.message}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Message Input */}
              <div className="px-4 py-3 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition">
                    <Smile size={20} className="text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition">
                    <Paperclip size={20} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                    className={cn("p-2 rounded-full transition", showQuickReplies ? "bg-emerald-100" : "hover:bg-gray-100")}
                    title="Quick replies — type / to filter"
                  >
                    <Zap size={20} className={showQuickReplies ? "text-emerald-600" : "text-gray-400"} />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Type a message or / for quick replies..."
                    className="flex-1 px-4 py-2.5 bg-gray-50 rounded-full text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white border border-transparent focus:border-emerald-200 transition text-gray-900"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="p-2.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition disabled:opacity-40 shadow-lg shadow-emerald-500/20"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel — Notes */}
            {rightPanel === "notes" && (
              <div className="w-[280px] border-l border-gray-200 bg-white flex flex-col shrink-0">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StickyNote size={16} className="text-amber-500" />
                    <h3 className="font-semibold text-sm text-gray-900">Notes</h3>
                  </div>
                  <button onClick={() => setRightPanel("none")}>
                    <X size={14} className="text-gray-400" />
                  </button>
                </div>
                <div className="p-3">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add internal note..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/30 resize-none text-gray-900"
                    rows={3}
                  />
                  <button
                    onClick={addNote}
                    disabled={!newNote.trim()}
                    className="mt-2 w-full py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition disabled:opacity-40"
                  >
                    Add Note
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-3 space-y-2">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <p className="text-xs text-gray-700 leading-relaxed">{note.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-amber-600 font-medium">{note.user.name}</span>
                        <span className="text-[10px] text-gray-400">{timeAgo(note.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                  {notes.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-6">No notes yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Right Panel — Contact Details */}
            {rightPanel === "contact" && (
              <div className="w-[280px] border-l border-gray-200 bg-white flex flex-col shrink-0">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-blue-500" />
                    <h3 className="font-semibold text-sm text-gray-900">Contact</h3>
                  </div>
                  <button onClick={() => setRightPanel("none")}>
                    <X size={14} className="text-gray-400" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-xl font-bold mb-3">
                      {getInitials(selected.contact.name || selected.contact.phoneNumber)}
                    </div>
                    <p className="font-semibold text-gray-900">
                      {selected.contact.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatPhoneNumber(selected.contact.phoneNumber)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg">
                      <Phone size={14} className="text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-medium">Phone</p>
                        <p className="text-xs text-gray-900">{formatPhoneNumber(selected.contact.phoneNumber)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg">
                      <Hash size={14} className="text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-medium">Status</p>
                        <p className="text-xs text-gray-900 capitalize">{selected.status.toLowerCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg">
                      <User size={14} className="text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-medium">Assigned To</p>
                        <p className="text-xs text-gray-900">{selected.assignedTo?.name || "Unassigned"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg">
                      <Bot size={14} className="text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-medium">AI Agent</p>
                        <p className="text-xs text-gray-900">{selected.isAIHandled ? "Active" : "Inactive"}</p>
                      </div>
                    </div>
                  </div>

                  {selected.contact.tags.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[10px] text-gray-400 uppercase font-medium mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {selected.contact.tags.map((t) => (
                          <span
                            key={t.tag.id}
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: t.tag.color + "18", color: t.tag.color }}
                          >
                            {t.tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
              <MessageSquare size={36} className="text-emerald-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700">Acme Co</h2>
            <p className="text-sm text-gray-400 mt-2 max-w-xs">
              Select a conversation from the left to start messaging your customers
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              +91 90560 06634 connected
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
