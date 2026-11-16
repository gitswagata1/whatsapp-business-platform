"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/hooks/useStore";
import Link from "next/link";
import {
  MessageSquare,
  Users,
  Send,
  Bot,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  BarChart3,
  Zap,
  Headphones,
  Target,
  ChevronRight,
  Activity,
  Sparkles,
} from "lucide-react";

type DashboardData = {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  totalContacts: number;
  messagesByDay: { date: string; inbound: number; outbound: number }[];
  conversationsByStatus: { status: string; count: number }[];
  topAgents: { name: string; conversations: number }[];
};

export default function DashboardPage() {
  const { user } = useStore();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statCards = [
    {
      label: "Active Conversations",
      value: data?.activeConversations || 0,
      change: "+12.5%",
      up: true,
      icon: MessageSquare,
      color: "emerald",
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Total Contacts",
      value: data?.totalContacts || 0,
      change: "+8.2%",
      up: true,
      icon: Users,
      color: "violet",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      label: "Messages Today",
      value: data?.messagesByDay?.slice(-1)?.[0]
        ? (data.messagesByDay.slice(-1)[0].inbound + data.messagesByDay.slice(-1)[0].outbound)
        : 0,
      change: "+23.1%",
      up: true,
      icon: Send,
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      label: "AI Handled",
      value: Math.round((data?.totalMessages || 0) * 0.35),
      change: "+42%",
      up: true,
      icon: Bot,
      color: "amber",
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  const quickActions = [
    { label: "New Broadcast", href: "/broadcasts", icon: Send, desc: "Send campaign" },
    { label: "Add Contact", href: "/contacts", icon: Users, desc: "Import leads" },
    { label: "Bot Studio", href: "/bot-studio", icon: Workflow, desc: "Create flow" },
    { label: "AI Agents", href: "/ai-agents", icon: Bot, desc: "Configure AI" },
  ];

  function Workflow(props: { size?: number; className?: string }) {
    return <Zap {...props} />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here&apos;s what&apos;s happening with Acme Co today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-700">+91 90560 06634 Connected</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-200"
          >
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Message Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Message Activity</h3>
              <p className="text-xs text-gray-500 mt-0.5">Last 14 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Inbound
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-violet-500" /> Outbound
              </span>
            </div>
          </div>
          {data?.messagesByDay && data.messagesByDay.length > 0 ? (
            <div className="flex items-end gap-1.5 h-44">
              {data.messagesByDay.slice(-14).map((day, i) => {
                const max = Math.max(...data.messagesByDay.map((d) => d.inbound + d.outbound), 1);
                const total = day.inbound + day.outbound;
                const height = Math.max((total / max) * 100, 2);
                const inPct = total > 0 ? (day.inbound / total) * 100 : 50;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                      {day.inbound} in / {day.outbound} out
                    </div>
                    <div
                      className="w-full rounded-t-md flex flex-col justify-end overflow-hidden transition-all group-hover:opacity-80"
                      style={{ height: `${height}%` }}
                    >
                      <div className="bg-emerald-500 rounded-t-sm" style={{ height: `${inPct}%` }} />
                      <div className="bg-violet-500" style={{ height: `${100 - inPct}%` }} />
                    </div>
                    <span className="text-[8px] text-gray-400">
                      {new Date(day.date).toLocaleDateString([], { day: "numeric" })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center">
              <div className="text-center">
                <Activity size={32} className="mx-auto mb-2 text-gray-200" />
                <p className="text-sm text-gray-400">No message data yet</p>
                <p className="text-xs text-gray-300 mt-1">Messages will appear here once you start</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-150 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-emerald-100 transition">
                  <action.icon size={20} className="text-gray-500 group-hover:text-emerald-600 transition" />
                </div>
                <span className="text-xs font-medium text-gray-700">{action.label}</span>
                <span className="text-[10px] text-gray-400">{action.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Conversations</h3>
            <Link href="/inbox" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-0.5">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {(data?.conversationsByStatus || []).map((item) => {
              const total = (data?.conversationsByStatus || []).reduce((a, b) => a + b.count, 0) || 1;
              const colors: Record<string, string> = {
                OPEN: "bg-emerald-500",
                PENDING: "bg-amber-500",
                RESOLVED: "bg-violet-500",
                CLOSED: "bg-gray-400",
              };
              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${colors[item.status] || "bg-gray-400"}`} />
                      <span className="text-sm text-gray-700 capitalize">{item.status.toLowerCase()}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${colors[item.status] || "bg-gray-400"} transition-all duration-500`}
                      style={{ width: `${(item.count / total) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {(!data?.conversationsByStatus || data.conversationsByStatus.length === 0) && (
              <div className="py-8 text-center">
                <MessageSquare size={28} className="mx-auto mb-2 text-gray-200" />
                <p className="text-xs text-gray-400">No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Agent Performance */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top Agents</h3>
            <Link href="/analytics" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-0.5">
              Details <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {(data?.topAgents || []).slice(0, 5).map((agent, i) => (
              <div key={agent.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                  {agent.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{agent.name}</p>
                  <p className="text-[10px] text-gray-400">{agent.conversations} conversations</p>
                </div>
                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                    style={{ width: `${Math.min(100, (agent.conversations / Math.max(...(data?.topAgents || []).map((a) => a.conversations), 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {(!data?.topAgents || data.topAgents.length === 0) && (
              <div className="py-8 text-center">
                <Headphones size={28} className="mx-auto mb-2 text-gray-200" />
                <p className="text-xs text-gray-400">No agent data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-amber-400" />
            <h3 className="font-semibold">AI Insights</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">Trend</span>
              </div>
              <p className="text-sm text-gray-300">
                Message volume is up 23% this week. Peak hours: 10AM-12PM.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Target size={14} className="text-amber-400" />
                <span className="text-xs font-medium text-amber-400">Suggestion</span>
              </div>
              <p className="text-sm text-gray-300">
                35% of queries are about pricing. Consider adding a pricing bot flow.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={14} className="text-blue-400" />
                <span className="text-xs font-medium text-blue-400">Performance</span>
              </div>
              <p className="text-sm text-gray-300">
                AI agents resolved 42% of queries without human handoff.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
