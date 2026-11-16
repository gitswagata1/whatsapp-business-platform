"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Users,
  Send,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Clock,
  Headphones,
  Activity,
  Sparkles,
  ChevronDown,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";

type AnalyticsData = {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  totalContacts: number;
  avgResponseTime: number;
  messagesByDay: { date: string; inbound: number; outbound: number }[];
  conversationsByStatus: { status: string; count: number }[];
  topAgents: { name: string; conversations: number; avgResponseTime: number }[];
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<"7d" | "14d" | "30d">("14d");

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Conversations",
      value: data.totalConversations,
      change: "+12.5%",
      up: true,
      icon: MessageSquare,
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Active Conversations",
      value: data.activeConversations,
      change: "+5.2%",
      up: true,
      icon: TrendingUp,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Messages",
      value: data.totalMessages,
      change: "+18.3%",
      up: true,
      icon: Send,
      gradient: "from-violet-500 to-purple-600",
    },
    {
      label: "Total Contacts",
      value: data.totalContacts,
      change: "+8.1%",
      up: true,
      icon: Users,
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  const sliceCount = period === "7d" ? 7 : period === "14d" ? 14 : 30;
  const chartData = (data.messagesByDay || []).slice(-sliceCount).map((d) => ({
    date: new Date(d.date).toLocaleDateString([], { month: "short", day: "numeric" }),
    Inbound: d.inbound,
    Outbound: d.outbound,
    Total: d.inbound + d.outbound,
  }));

  const statusColors: Record<string, string> = {
    OPEN: "#10b981",
    PENDING: "#f59e0b",
    RESOLVED: "#8b5cf6",
    CLOSED: "#94a3b8",
  };
  const pieData = (data.conversationsByStatus || []).map((s) => ({
    name: s.status.charAt(0) + s.status.slice(1).toLowerCase(),
    value: s.count,
    color: statusColors[s.status] || "#94a3b8",
  }));

  const totalByStatus = pieData.reduce((a, b) => a + b.value, 0) || 1;

  const channelData = [
    { name: "WhatsApp", value: 78, color: "#25d366" },
    { name: "AI Agent", value: 35, color: "#8b5cf6" },
    { name: "Bot Flow", value: 22, color: "#f59e0b" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor your WhatsApp business performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(["7d", "14d", "30d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  period === p ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p === "7d" ? "7 Days" : p === "14d" ? "14 Days" : "30 Days"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${stat.up ? "text-emerald-600" : "text-red-500"}`}>
                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Message Activity Area Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-gray-900">Message Activity</h3>
            <p className="text-xs text-gray-500 mt-0.5">Inbound vs outbound messages over time</p>
          </div>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              <Area type="monotone" dataKey="Inbound" stroke="#10b981" strokeWidth={2} fill="url(#colorInbound)" />
              <Area type="monotone" dataKey="Outbound" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorOutbound)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <Activity size={32} className="mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">No message data yet</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Conversations by Status Pie */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Conversations by Status</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                      <span className="text-[10px] text-gray-400">
                        {Math.round((item.value / totalByStatus) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[250px] flex items-center justify-center">
              <p className="text-sm text-gray-400">No data</p>
            </div>
          )}
        </div>

        {/* Response Channels */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Response Channels</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={channelData} layout="vertical" barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#374151" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {channelData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {channelData.map((ch) => (
              <div key={ch.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: ch.color }} />
                  <span className="text-gray-600">{ch.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{ch.value} replies</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Performance */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={18} className="text-amber-400" />
            <h3 className="font-semibold">AI Performance</h3>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-400">Resolution Rate</span>
                <span className="text-sm font-bold text-emerald-400">42%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: "42%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-400">Avg Confidence</span>
                <span className="text-sm font-bold text-blue-400">87%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500" style={{ width: "87%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-400">Customer Satisfaction</span>
                <span className="text-sm font-bold text-amber-400">91%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: "91%" }} />
              </div>
            </div>
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Total AI Interactions</span>
                <span className="font-bold text-white">1,247</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-gray-400">Escalated to Human</span>
                <span className="font-bold text-white">89</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-gray-400">Avg Response Time</span>
                <span className="font-bold text-white">1.2s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Leaderboard */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-gray-900">Agent Leaderboard</h3>
            <p className="text-xs text-gray-500 mt-0.5">Performance ranking by conversations handled</p>
          </div>
        </div>
        {data.topAgents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Rank</th>
                  <th className="text-left pb-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Agent</th>
                  <th className="text-left pb-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Conversations</th>
                  <th className="text-left pb-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Avg Response</th>
                  <th className="text-left pb-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody>
                {data.topAgents.map((agent, i) => {
                  const maxConv = Math.max(...data.topAgents.map((a) => a.conversations), 1);
                  const pct = (agent.conversations / maxConv) * 100;
                  return (
                    <tr key={agent.name} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="py-3.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-400"
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                            {agent.name[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{agent.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-sm text-gray-600 font-medium">{agent.conversations}</td>
                      <td className="py-3.5 text-sm text-gray-600">
                        {agent.avgResponseTime > 0 ? `${Math.round(agent.avgResponseTime / 60)}m` : "—"}
                      </td>
                      <td className="py-3.5">
                        <div className="w-24 bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Headphones size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400">No agent data yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
