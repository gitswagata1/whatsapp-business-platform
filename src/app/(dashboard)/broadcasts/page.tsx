"use client";

import { useState, useEffect } from "react";
import { timeAgo, cn } from "@/lib/utils";
import {
  Send,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Eye,
  Play,
  X,
  FileText,
  Megaphone,
  Calendar,
  RotateCcw,
  Users,
  Filter,
  TrendingUp,
  ArrowUpRight,
  Target,
  ChevronRight,
  Pause,
  Copy,
  Trash2,
} from "lucide-react";

type Broadcast = {
  id: string;
  name: string;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  totalRecipients: number;
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  failed: number;
  createdAt: string;
  template: { id: string; name: string; body: string };
  createdBy: { name: string };
};

type Template = {
  id: string;
  name: string;
  body: string;
  category: string;
  status: string;
};

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [newBroadcast, setNewBroadcast] = useState({
    name: "",
    templateId: "",
    scheduleDate: "",
    scheduleTime: "",
    targetSegment: "all",
  });
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "MARKETING",
    body: "",
    footer: "",
  });

  const fetchBroadcasts = async () => {
    const res = await fetch("/api/broadcasts");
    if (res.ok) setBroadcasts(await res.json());
  };

  const fetchTemplates = async () => {
    const res = await fetch("/api/templates");
    if (res.ok) setTemplates(await res.json());
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount; state is set after the request resolves
    fetchBroadcasts();
    fetchTemplates();
  }, []);

  const createTemplate = async () => {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTemplate),
    });
    if (res.ok) {
      setShowTemplateModal(false);
      setNewTemplate({ name: "", category: "MARKETING", body: "", footer: "" });
      fetchTemplates();
    }
  };

  const sendBroadcast = async (id: string) => {
    await fetch(`/api/broadcasts/${id}/send`, { method: "POST" });
    fetchBroadcasts();
  };

  const filtered =
    statusFilter === "ALL"
      ? broadcasts
      : broadcasts.filter((b) => b.status === statusFilter);

  const totalSent = broadcasts.reduce((a, b) => a + b.sent, 0);
  const totalDelivered = broadcasts.reduce((a, b) => a + b.delivered, 0);
  const totalRead = broadcasts.reduce((a, b) => a + b.read, 0);
  const totalReplied = broadcasts.reduce((a, b) => a + b.replied, 0);

  const statusConfig: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
    DRAFT: { icon: <FileText size={12} />, bg: "bg-gray-100", text: "text-gray-600" },
    SCHEDULED: { icon: <Clock size={12} />, bg: "bg-blue-50", text: "text-blue-600" },
    SENDING: { icon: <Loader size={12} className="animate-spin" />, bg: "bg-amber-50", text: "text-amber-600" },
    COMPLETED: { icon: <CheckCircle size={12} />, bg: "bg-emerald-50", text: "text-emerald-600" },
    FAILED: { icon: <XCircle size={12} />, bg: "bg-red-50", text: "text-red-600" },
    CANCELLED: { icon: <XCircle size={12} />, bg: "bg-gray-50", text: "text-gray-500" },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Broadcasts</h1>
          <p className="text-sm text-gray-500 mt-1">Send targeted campaigns with scheduling and retargeting</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <FileText size={16} />
            Templates
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20"
          >
            <Plus size={16} />
            New Campaign
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Campaigns", value: broadcasts.length, icon: Megaphone, gradient: "from-emerald-500 to-emerald-600" },
          { label: "Sent", value: totalSent, icon: Send, gradient: "from-blue-500 to-blue-600" },
          { label: "Delivered", value: totalDelivered, icon: CheckCircle, gradient: "from-violet-500 to-purple-600" },
          { label: "Read", value: totalRead, icon: Eye, gradient: "from-amber-500 to-orange-500" },
          { label: "Replied", value: totalReplied, icon: TrendingUp, gradient: "from-pink-500 to-rose-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign List */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Campaigns</h3>
          <div className="flex items-center gap-1.5">
            {["ALL", "DRAFT", "SCHEDULED", "SENDING", "COMPLETED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition",
                  statusFilter === s ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map((bc) => {
            const sc = statusConfig[bc.status] || statusConfig.DRAFT;
            const deliveryRate = bc.sent > 0 ? Math.round((bc.delivered / bc.sent) * 100) : 0;
            const readRate = bc.delivered > 0 ? Math.round((bc.read / bc.delivered) * 100) : 0;

            return (
              <div key={bc.id} className="px-5 py-4 hover:bg-gray-50/50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-medium text-gray-900">{bc.name}</h4>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.text}`}>
                        {sc.icon}
                        {bc.status}
                      </span>
                      {bc.scheduledAt && (
                        <span className="flex items-center gap-1 text-[10px] text-blue-500">
                          <Calendar size={10} />
                          {new Date(bc.scheduledAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                      <span>Template: {bc.template.name}</span>
                      <span>By: {bc.createdBy.name}</span>
                      <span>{timeAgo(bc.createdAt)}</span>
                    </div>
                  </div>

                  {/* Funnel Stats */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {[
                        { label: "Recipients", value: bc.totalRecipients, color: "text-gray-600" },
                        { label: "Sent", value: bc.sent, color: "text-blue-600" },
                        { label: "Delivered", value: bc.delivered, color: "text-emerald-600", pct: deliveryRate },
                        { label: "Read", value: bc.read, color: "text-violet-600", pct: readRate },
                        { label: "Failed", value: bc.failed, color: "text-red-500" },
                      ].map((m) => (
                        <div key={m.label} className="text-center min-w-[52px]">
                          <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                          <p className="text-[9px] text-gray-400 uppercase">{m.label}</p>
                          {m.pct !== undefined && m.pct > 0 && (
                            <p className="text-[9px] text-emerald-500 font-medium">{m.pct}%</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                      {bc.status === "DRAFT" && (
                        <button
                          onClick={() => sendBroadcast(bc.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition"
                        >
                          <Play size={12} />
                          Send
                        </button>
                      )}
                      {bc.status === "COMPLETED" && (
                        <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                          <RotateCcw size={12} />
                          Retarget
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Progress Bar */}
                {bc.sent > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden flex">
                      <div className="bg-emerald-500 h-full" style={{ width: `${deliveryRate}%` }} />
                      <div className="bg-violet-500 h-full" style={{ width: `${readRate > deliveryRate ? 0 : (readRate / 100) * deliveryRate}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400">{deliveryRate}% delivered</span>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Megaphone size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-gray-500 text-sm">No campaigns found</p>
              <p className="text-xs text-gray-400 mt-1">Create your first broadcast campaign</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">New Campaign</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Campaign Name</label>
                <input
                  type="text"
                  value={newBroadcast.name}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-900"
                  placeholder="e.g., Diwali Sale 2026"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Template</label>
                <select
                  value={newBroadcast.templateId}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, templateId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-900"
                >
                  <option value="">Select a template</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              {newBroadcast.templateId && (
                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                  <p className="text-[10px] text-emerald-600 font-semibold uppercase mb-1">Preview</p>
                  <p className="text-sm text-gray-700">
                    {templates.find((t) => t.id === newBroadcast.templateId)?.body}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Target Segment</label>
                <select
                  value={newBroadcast.targetSegment}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, targetSegment: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-900"
                >
                  <option value="all">All Contacts</option>
                  <option value="new_leads">New Leads</option>
                  <option value="customers">Customers</option>
                  <option value="vip">VIP</option>
                  <option value="unread_prev">Didn&apos;t Read Previous</option>
                  <option value="no_reply">Didn&apos;t Reply Previous</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Schedule Date</label>
                  <input
                    type="date"
                    value={newBroadcast.scheduleDate}
                    onChange={(e) => setNewBroadcast({ ...newBroadcast, scheduleDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Schedule Time</label>
                  <input
                    type="time"
                    value={newBroadcast.scheduleTime}
                    onChange={(e) => setNewBroadcast({ ...newBroadcast, scheduleTime: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-900"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-400">Leave date/time empty to save as draft for immediate sending</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                disabled={!newBroadcast.name || !newBroadcast.templateId}
                className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-40 shadow-lg shadow-emerald-500/20"
              >
                {newBroadcast.scheduleDate ? "Schedule Campaign" : "Create as Draft"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Message Templates</h3>
              <button onClick={() => setShowTemplateModal(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {templates.length > 0 && (
              <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                {templates.map((t) => (
                  <div key={t.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">{t.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{t.category}</span>
                    </div>
                    <p className="text-xs text-gray-600">{t.body}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Create Template</p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-900"
                  placeholder="Template name"
                />
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none text-gray-700"
                >
                  <option value="MARKETING">Marketing</option>
                  <option value="UTILITY">Utility</option>
                  <option value="AUTHENTICATION">Authentication</option>
                </select>
                <textarea
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none text-gray-900"
                  rows={3}
                  placeholder="Message body (use {{1}}, {{2}} for variables)"
                />
                <button
                  onClick={createTemplate}
                  disabled={!newTemplate.name || !newTemplate.body}
                  className="w-full py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-40"
                >
                  Create Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
