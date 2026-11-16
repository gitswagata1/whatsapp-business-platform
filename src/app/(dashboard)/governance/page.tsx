"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Bot,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  Eye,
  Settings,
  Activity,
  BarChart3,
  Zap,
  ChevronRight,
  Filter,
  XCircle,
} from "lucide-react";

type GovernanceStats = {
  totalInteractions: number;
  escalatedToHuman: number;
  avgConfidence: number;
  blockedMessages: number;
};

type AuditLog = {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  contact: string;
  confidence: number;
  status: "approved" | "flagged" | "blocked";
  message: string;
};

const MOCK_STATS: GovernanceStats = {
  totalInteractions: 1247,
  escalatedToHuman: 89,
  avgConfidence: 0.87,
  blockedMessages: 12,
};

const MOCK_LOGS: AuditLog[] = [
  { id: "1", timestamp: "2 min ago", agent: "Acme Assistant", action: "Auto Reply", contact: "+91 98765 43210", confidence: 0.94, status: "approved", message: "Provided product pricing info" },
  { id: "2", timestamp: "5 min ago", agent: "Acme Assistant", action: "Auto Reply", contact: "+91 87654 32109", confidence: 0.72, status: "flagged", message: "Attempted warranty claim response" },
  { id: "3", timestamp: "12 min ago", agent: "Acme Assistant", action: "Escalation", contact: "+91 76543 21098", confidence: 0.45, status: "blocked", message: "Complex refund request — escalated to human" },
  { id: "4", timestamp: "18 min ago", agent: "Acme Assistant", action: "Auto Reply", contact: "+91 65432 10987", confidence: 0.91, status: "approved", message: "Sent business hours information" },
  { id: "5", timestamp: "25 min ago", agent: "Acme Assistant", action: "Auto Reply", contact: "+91 54321 09876", confidence: 0.88, status: "approved", message: "Shared product catalog link" },
  { id: "6", timestamp: "32 min ago", agent: "Acme Assistant", action: "Auto Reply", contact: "+91 43210 98765", confidence: 0.63, status: "flagged", message: "Payment status inquiry — partial info given" },
  { id: "7", timestamp: "45 min ago", agent: "Acme Assistant", action: "Blocked", contact: "+91 32109 87654", confidence: 0.31, status: "blocked", message: "Sensitive medical query blocked by policy" },
];

const POLICIES = [
  { name: "Auto-escalate on low confidence", threshold: "< 50%", enabled: true },
  { name: "Block sensitive topic replies", threshold: "Medical, Legal, Financial", enabled: true },
  { name: "Require human review for refunds", threshold: "All refund queries", enabled: true },
  { name: "Rate limit per contact", threshold: "Max 20 msgs/hour", enabled: false },
  { name: "PII detection & masking", threshold: "Auto-mask SSN, card numbers", enabled: true },
];

export default function GovernancePage() {
  const [filter, setFilter] = useState<"all" | "approved" | "flagged" | "blocked">("all");
  const [logs] = useState(MOCK_LOGS);
  const [stats] = useState(MOCK_STATS);

  const filtered = filter === "all" ? logs : logs.filter((l) => l.status === filter);

  const statCards = [
    { label: "Total AI Interactions", value: stats.totalInteractions.toLocaleString(), icon: Bot, color: "bg-emerald-500" },
    { label: "Escalated to Human", value: stats.escalatedToHuman, icon: AlertTriangle, color: "bg-amber-500" },
    { label: "Avg. Confidence", value: `${Math.round(stats.avgConfidence * 100)}%`, icon: TrendingUp, color: "bg-blue-500" },
    { label: "Blocked Messages", value: stats.blockedMessages, icon: XCircle, color: "bg-red-500" },
  ];

  const statusConfig = {
    approved: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Approved" },
    flagged: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Flagged" },
    blocked: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "Blocked" },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Shield size={24} className="text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI Governance</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">Monitor, audit, and control AI agent behavior</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon size={20} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audit Log */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">AI Audit Log</h3>
              <p className="text-xs text-gray-500 mt-0.5">Real-time AI agent activity</p>
            </div>
            <div className="flex items-center gap-1.5">
              {(["all", "approved", "flagged", "blocked"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filter === f
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map((log) => {
              const sc = statusConfig[log.status];
              return (
                <div key={log.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${sc.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{log.action}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.text}`}>
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{log.message}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500">{log.contact}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <div className="w-12 bg-gray-100 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all ${
                            log.confidence >= 0.8 ? "bg-emerald-500" : log.confidence >= 0.6 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${log.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400">{Math.round(log.confidence * 100)}%</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0 w-16 text-right">{log.timestamp}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Policies */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Safety Policies</h3>
            <p className="text-xs text-gray-500 mt-0.5">Rules governing AI behavior</p>
          </div>
          <div className="p-4 space-y-3">
            {POLICIES.map((policy) => (
              <div
                key={policy.name}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-emerald-200 transition"
              >
                <div className={`mt-0.5 w-8 h-5 rounded-full flex items-center ${policy.enabled ? "bg-emerald-500 justify-end" : "bg-gray-200 justify-start"} p-0.5 cursor-pointer transition-colors`}>
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{policy.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{policy.threshold}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Confidence Distribution */}
          <div className="p-5 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Confidence Distribution</h4>
            <div className="space-y-2">
              {[
                { range: "90-100%", pct: 45, color: "bg-emerald-500" },
                { range: "70-89%", pct: 30, color: "bg-blue-500" },
                { range: "50-69%", pct: 15, color: "bg-amber-500" },
                { range: "< 50%", pct: 10, color: "bg-red-500" },
              ].map((row) => (
                <div key={row.range} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 w-14">{row.range}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500 w-8 text-right">{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
