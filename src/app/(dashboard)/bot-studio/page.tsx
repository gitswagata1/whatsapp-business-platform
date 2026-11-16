"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Plus,
  MessageSquare,
  ArrowRight,
  X,
  Zap,
  GitBranch,
  Clock,
  Bot,
  Send,
  Type,
  Image,
  List,
  Trash2,
  Play,
  Save,
  MoreVertical,
  ChevronDown,
  Workflow,
  Sparkles,
  Settings,
  Copy,
} from "lucide-react";

type BotNode = {
  id: string;
  type: "trigger" | "message" | "question" | "condition" | "delay" | "ai_reply" | "assign" | "tag";
  title: string;
  config: Record<string, string>;
  next?: string;
};

type BotFlow = {
  id: string;
  name: string;
  isActive: boolean;
  nodes: BotNode[];
  createdAt: string;
};

const NODE_TYPES = [
  { type: "message", label: "Send Message", icon: MessageSquare, color: "emerald", desc: "Send a text or media message" },
  { type: "question", label: "Ask Question", icon: Type, color: "blue", desc: "Ask and wait for a reply" },
  { type: "condition", label: "Condition", icon: GitBranch, color: "amber", desc: "Branch based on user reply" },
  { type: "delay", label: "Delay", icon: Clock, color: "gray", desc: "Wait before next step" },
  { type: "ai_reply", label: "AI Reply", icon: Sparkles, color: "purple", desc: "Let AI agent respond" },
  { type: "assign", label: "Assign Agent", icon: Bot, color: "indigo", desc: "Hand off to human agent" },
  { type: "tag", label: "Add Tag", icon: List, color: "pink", desc: "Tag the contact" },
];

export default function BotStudioPage() {
  const [flows, setFlows] = useState<BotFlow[]>([
    {
      id: "welcome-flow",
      name: "Welcome Flow",
      isActive: true,
      nodes: [
        { id: "1", type: "trigger", title: "When message received", config: { keyword: "hi, hello, hey" } },
        { id: "2", type: "message", title: "Welcome Message", config: { text: "Hello! Welcome to Acme Co 👋\nHow can we help you today?" } },
        { id: "3", type: "question", title: "Ask Intent", config: { text: "Please select:\n1. Product Info\n2. Pricing\n3. Support\n4. Talk to Agent" } },
        { id: "4", type: "condition", title: "Route by Reply", config: { condition: "reply_contains" } },
        { id: "5", type: "ai_reply", title: "AI Handles Query", config: { agent: "Acme Assistant" } },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: "lead-flow",
      name: "Lead Qualification",
      isActive: false,
      nodes: [
        { id: "1", type: "trigger", title: "New contact message", config: { keyword: "*" } },
        { id: "2", type: "question", title: "Ask Name", config: { text: "Hi there! I'd love to help. May I know your name?" } },
        { id: "3", type: "question", title: "Ask Interest", config: { text: "Great {{name}}! What product are you interested in?" } },
        { id: "4", type: "tag", title: "Tag as Lead", config: { tag: "New Lead" } },
        { id: "5", type: "assign", title: "Assign to Sales", config: { team: "Sales" } },
      ],
      createdAt: new Date().toISOString(),
    },
  ]);

  const [selectedFlow, setSelectedFlow] = useState<string | null>("welcome-flow");
  const [showAddNode, setShowAddNode] = useState(false);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [showCreateFlow, setShowCreateFlow] = useState(false);
  const [newFlowName, setNewFlowName] = useState("");

  const activeFlow = flows.find((f) => f.id === selectedFlow);

  const getNodeColor = (type: string) => {
    const colors: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
      trigger: { bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-500", badge: "bg-orange-500" },
      message: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-500", badge: "bg-emerald-500" },
      question: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-500", badge: "bg-blue-500" },
      condition: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-500", badge: "bg-amber-500" },
      delay: { bg: "bg-gray-50", border: "border-gray-200", icon: "text-gray-500", badge: "bg-gray-500" },
      ai_reply: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-500", badge: "bg-purple-500" },
      assign: { bg: "bg-indigo-50", border: "border-indigo-200", icon: "text-indigo-500", badge: "bg-indigo-500" },
      tag: { bg: "bg-pink-50", border: "border-pink-200", icon: "text-pink-500", badge: "bg-pink-500" },
    };
    return colors[type] || colors.message;
  };

  const getNodeIcon = (type: string) => {
    const icons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
      trigger: Zap,
      message: MessageSquare,
      question: Type,
      condition: GitBranch,
      delay: Clock,
      ai_reply: Sparkles,
      assign: Bot,
      tag: List,
    };
    return icons[type] || MessageSquare;
  };

  const addNode = (type: string) => {
    if (!activeFlow) return;
    const newNode: BotNode = {
      id: Date.now().toString(),
      type: type as BotNode["type"],
      title: NODE_TYPES.find((n) => n.type === type)?.label || "New Node",
      config: {},
    };
    setFlows((prev) =>
      prev.map((f) =>
        f.id === activeFlow.id ? { ...f, nodes: [...f.nodes, newNode] } : f
      )
    );
    setShowAddNode(false);
  };

  const deleteNode = (nodeId: string) => {
    if (!activeFlow) return;
    setFlows((prev) =>
      prev.map((f) =>
        f.id === activeFlow.id
          ? { ...f, nodes: f.nodes.filter((n) => n.id !== nodeId) }
          : f
      )
    );
  };

  const createFlow = () => {
    if (!newFlowName.trim()) return;
    const flow: BotFlow = {
      id: Date.now().toString(),
      name: newFlowName,
      isActive: false,
      nodes: [
        { id: "1", type: "trigger", title: "When message received", config: { keyword: "" } },
      ],
      createdAt: new Date().toISOString(),
    };
    setFlows((prev) => [...prev, flow]);
    setSelectedFlow(flow.id);
    setNewFlowName("");
    setShowCreateFlow(false);
  };

  const toggleFlowActive = (flowId: string) => {
    setFlows((prev) =>
      prev.map((f) => (f.id === flowId ? { ...f, isActive: !f.isActive } : f))
    );
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="h-14 px-6 flex items-center justify-between border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <Workflow size={20} className="text-emerald-600" />
          <h1 className="font-bold text-gray-900">Bot Studio</h1>
          <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
            {flows.filter((f) => f.isActive).length} active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateFlow(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20"
          >
            <Plus size={16} />
            New Flow
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Flow List */}
        <div className="w-[260px] border-r border-gray-200 bg-gray-50/50 flex flex-col shrink-0">
          <div className="p-3">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-2 mb-2">Bot Flows</p>
            <div className="space-y-1">
              {flows.map((flow) => (
                <button
                  key={flow.id}
                  onClick={() => setSelectedFlow(flow.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg transition flex items-center gap-3",
                    selectedFlow === flow.id
                      ? "bg-white shadow-sm border border-gray-200"
                      : "hover:bg-white/60"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    flow.isActive ? "bg-emerald-100" : "bg-gray-100"
                  )}>
                    <Workflow size={16} className={flow.isActive ? "text-emerald-600" : "text-gray-400"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{flow.name}</p>
                    <p className="text-[10px] text-gray-400">{flow.nodes.length} steps</p>
                  </div>
                  <span className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    flow.isActive ? "bg-emerald-400" : "bg-gray-300"
                  )} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Flow Builder Canvas */}
        {activeFlow ? (
          <div className="flex-1 flex flex-col">
            {/* Flow Header */}
            <div className="px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">{activeFlow.name}</h2>
                <p className="text-xs text-gray-500">{activeFlow.nodes.length} steps in this flow</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFlowActive(activeFlow.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition",
                    activeFlow.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  )}
                >
                  <Play size={12} />
                  {activeFlow.isActive ? "Active" : "Inactive"}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition">
                  <Save size={12} />
                  Save
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
              <div className="max-w-xl mx-auto space-y-0">
                {activeFlow.nodes.map((node, index) => {
                  const color = getNodeColor(node.type);
                  const Icon = getNodeIcon(node.type);

                  return (
                    <div key={node.id}>
                      {/* Node */}
                      <div
                        className={cn(
                          "relative rounded-xl border-2 p-4 transition-all hover:shadow-md cursor-pointer group",
                          color.bg,
                          color.border,
                          editingNode === node.id && "ring-2 ring-offset-2 ring-blue-500"
                        )}
                        onClick={() => setEditingNode(editingNode === node.id ? null : node.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", color.badge)}>
                            <Icon size={16} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">
                                  Step {index + 1} · {node.type.replace("_", " ")}
                                </p>
                                <p className="font-medium text-sm text-gray-900 mt-0.5">{node.title}</p>
                              </div>
                              {node.type !== "trigger" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition"
                                >
                                  <Trash2 size={14} className="text-red-400" />
                                </button>
                              )}
                            </div>
                            {node.config.text && (
                              <div className="mt-2 bg-white/60 rounded-lg px-3 py-2 border border-white">
                                <p className="text-xs text-gray-600 whitespace-pre-line">{node.config.text}</p>
                              </div>
                            )}
                            {node.config.keyword && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {node.config.keyword.split(",").map((kw) => (
                                  <span key={kw} className="text-[10px] px-2 py-0.5 bg-white/80 rounded-full text-gray-600 border">
                                    {kw.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                            {node.config.agent && (
                              <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                                <Bot size={12} /> {node.config.agent}
                              </p>
                            )}
                            {node.config.tag && (
                              <p className="text-xs text-pink-600 mt-2 flex items-center gap-1">
                                <List size={12} /> {node.config.tag}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Connector */}
                      {index < activeFlow.nodes.length - 1 && (
                        <div className="flex justify-center py-1">
                          <div className="w-0.5 h-6 bg-gray-300 rounded-full" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add Node Button */}
                <div className="flex justify-center pt-2">
                  <div className="w-0.5 h-4 bg-gray-300 rounded-full" />
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowAddNode(true)}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                  >
                    <Plus size={16} />
                    Add Step
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Workflow size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="text-gray-500">Select a flow or create a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Node Modal */}
      {showAddNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Step</h3>
              <button onClick={() => setShowAddNode(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-2">
              {NODE_TYPES.map((nt) => {
                const Icon = getNodeIcon(nt.type);
                const color = getNodeColor(nt.type);
                return (
                  <button
                    key={nt.type}
                    onClick={() => addNode(nt.type)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition text-left"
                  >
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", color.badge)}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{nt.label}</p>
                      <p className="text-xs text-gray-500">{nt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Create Flow Modal */}
      {showCreateFlow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">New Bot Flow</h3>
              <button onClick={() => setShowCreateFlow(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <input
              type="text"
              value={newFlowName}
              onChange={(e) => setNewFlowName(e.target.value)}
              placeholder="Flow name (e.g., Order Tracking)"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-900 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateFlow(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createFlow}
                disabled={!newFlowName.trim()}
                className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-40"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
