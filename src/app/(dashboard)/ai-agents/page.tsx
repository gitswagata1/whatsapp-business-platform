"use client";

import { useState, useEffect } from "react";
import { timeAgo } from "@/lib/utils";
import {
  Bot,
  Plus,
  Power,
  PowerOff,
  Settings,
  Trash2,
  Brain,
  X,
  Sparkles,
  MessageSquare,
} from "lucide-react";

type AIAgent = {
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

export default function AIAgentsPage() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    systemPrompt: "",
    knowledgeBase: "",
    model: "claude-sonnet-4-20250514",
    temperature: 0.7,
    maxTokens: 1024,
  });

  const fetchAgents = async () => {
    const res = await fetch("/api/ai-agents");
    if (res.ok) setAgents(await res.json());
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount; state is set after the request resolves
    fetchAgents();
  }, []);

  const createAgent = async () => {
    const res = await fetch("/api/ai-agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowCreateModal(false);
      setForm({
        name: "",
        description: "",
        systemPrompt: "",
        knowledgeBase: "",
        model: "claude-sonnet-4-20250514",
        temperature: 0.7,
        maxTokens: 1024,
      });
      fetchAgents();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Agents</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure AI-powered chatbots to handle customer queries
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#25d366] text-white rounded-lg text-sm font-medium hover:bg-[#20bd5a] transition"
        >
          <Plus size={16} />
          Create Agent
        </button>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Bot size={24} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-xs text-gray-500">{agent.model}</p>
                </div>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  agent.isActive ? "bg-green-400" : "bg-gray-300"
                }`}
              />
            </div>

            {agent.description && (
              <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Temperature</span>
                <span className="text-gray-900 font-medium">{agent.temperature}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Max Tokens</span>
                <span className="text-gray-900 font-medium">{agent.maxTokens}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Knowledge Base</span>
                <span className="text-gray-900 font-medium">
                  {agent.knowledgeBase ? "Configured" : "None"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900 font-medium">{timeAgo(agent.createdAt)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => setEditingAgent(agent)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <Settings size={14} />
                Configure
              </button>
              <button className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
                <MessageSquare size={14} />
                Test
              </button>
            </div>
          </div>
        ))}

        {/* Create Card */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:border-[#25d366] hover:bg-green-50/30 transition min-h-[280px]"
        >
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Plus size={24} className="text-gray-400" />
          </div>
          <p className="font-medium text-gray-600">Create New Agent</p>
          <p className="text-xs text-gray-400 mt-1">
            Train an AI on your business knowledge
          </p>
        </button>
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Sparkles size={20} className="text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Create AI Agent</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  placeholder="e.g., Sales Assistant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  placeholder="What does this agent do?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
                <textarea
                  value={form.systemPrompt}
                  onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none text-gray-900"
                  rows={4}
                  placeholder="You are a helpful customer support agent for [Company]. You help customers with..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Knowledge Base
                  <span className="text-gray-400 font-normal ml-1">(paste your FAQ/docs)</span>
                </label>
                <textarea
                  value={form.knowledgeBase}
                  onChange={(e) => setForm({ ...form, knowledgeBase: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none text-gray-900"
                  rows={5}
                  placeholder="Paste your product information, FAQs, pricing details, policies..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <select
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none text-gray-700"
                  >
                    <option value="claude-sonnet-4-20250514">Claude Sonnet</option>
                    <option value="claude-haiku-4-5-20251001">Claude Haiku</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                  <input
                    type="number"
                    value={form.temperature}
                    onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none text-gray-900"
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                  <input
                    type="number"
                    value={form.maxTokens}
                    onChange={(e) => setForm({ ...form, maxTokens: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none text-gray-900"
                    min={100}
                    max={4096}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={createAgent}
                disabled={!form.name}
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
              >
                Create Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
