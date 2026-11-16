"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/hooks/useStore";
import {
  Phone,
  Users,
  Clock,
  Shield,
  Key,
  Plus,
  X,
  Check,
  Settings,
  Globe,
  UserCog,
} from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  _count: { assignedChats: number };
};

type WhatsAppAccount = {
  id: string;
  phoneNumber: string;
  phoneNumberId: string;
  wabaId: string;
  businessName: string | null;
  isActive: boolean;
  qualityRating: string | null;
};

export default function SettingsPage() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", password: "", role: "AGENT" });
  const [newAccount, setNewAccount] = useState({
    phoneNumber: "",
    phoneNumberId: "",
    wabaId: "",
    accessToken: "",
    businessName: "",
  });

  useEffect(() => {
    fetch("/api/settings/team").then((r) => r.json()).then(setTeam);
    fetch("/api/settings/whatsapp-accounts").then((r) => r.json()).then(setAccounts);
  }, []);

  const addMember = async () => {
    const res = await fetch("/api/settings/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMember),
    });
    if (res.ok) {
      setShowAddMember(false);
      setNewMember({ name: "", email: "", password: "", role: "AGENT" });
      const data = await fetch("/api/settings/team").then((r) => r.json());
      setTeam(data);
    }
  };

  const addAccount = async () => {
    const res = await fetch("/api/settings/whatsapp-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAccount),
    });
    if (res.ok) {
      setShowAddAccount(false);
      setNewAccount({ phoneNumber: "", phoneNumberId: "", wabaId: "", accessToken: "", businessName: "" });
      const data = await fetch("/api/settings/whatsapp-accounts").then((r) => r.json());
      setAccounts(data);
    }
  };

  const tabs = [
    { id: "whatsapp", label: "WhatsApp Numbers", icon: Phone },
    { id: "team", label: "Team Members", icon: Users },
    { id: "api", label: "API Keys", icon: Key },
  ];

  const roleColors: Record<string, string> = {
    OWNER: "bg-purple-100 text-purple-700",
    ADMIN: "bg-blue-100 text-blue-700",
    SUPERVISOR: "bg-yellow-100 text-yellow-700",
    AGENT: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage Acme Co WhatsApp accounts, team, and integrations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* WhatsApp Numbers Tab */}
      {activeTab === "whatsapp" && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Connected WhatsApp Numbers</h3>
            <button
              onClick={() => setShowAddAccount(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#25d366] text-white rounded-lg text-sm font-medium hover:bg-[#20bd5a] transition"
            >
              <Plus size={14} />
              Add Number
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {accounts.map((acc) => (
              <div key={acc.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#25d366]/10 flex items-center justify-center">
                    <Phone size={18} className="text-[#25d366]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{acc.phoneNumber}</p>
                    <p className="text-xs text-gray-500">
                      {acc.businessName || "No business name"} · ID: {acc.phoneNumberId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {acc.qualityRating && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-600">
                      {acc.qualityRating}
                    </span>
                  )}
                  <span className={`w-2.5 h-2.5 rounded-full ${acc.isActive ? "bg-green-400" : "bg-gray-300"}`} />
                </div>
              </div>
            ))}
            {accounts.length === 0 && (
              <div className="py-12 text-center">
                <Globe size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No WhatsApp numbers connected</p>
                <p className="text-xs text-gray-400 mt-1">Add your WhatsApp Business API number to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Team Members ({team.length})</h3>
            {(user?.role === "OWNER" || user?.role === "ADMIN") && (
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#25d366] text-white rounded-lg text-sm font-medium hover:bg-[#20bd5a] transition"
              >
                <Plus size={14} />
                Add Member
              </button>
            )}
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Member</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Active Chats</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member) => (
                <tr key={member.id} className="border-b border-gray-100">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#075e54] flex items-center justify-center text-white text-xs font-medium">
                        {member.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColors[member.role]}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {member._count.assignedChats}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs ${member.isActive ? "text-green-600" : "text-gray-400"}`}>
                      <span className={`w-2 h-2 rounded-full ${member.isActive ? "bg-green-400" : "bg-gray-300"}`} />
                      {member.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === "api" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">API Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/whatsapp/webhook`}
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/whatsapp/webhook`)}
                      className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Verify Token</label>
                  <input
                    type="text"
                    readOnly
                    value="Configure in .env → WHATSAPP_WEBHOOK_VERIFY_TOKEN"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anthropic API Key</label>
                  <input
                    type="text"
                    readOnly
                    value="Configure in .env → ANTHROPIC_API_KEY"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Add Team Member</h3>
              <button onClick={() => setShowAddMember(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#25d366] text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#25d366] text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newMember.password}
                  onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#25d366] text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none text-gray-700"
                >
                  <option value="AGENT">Agent</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddMember(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={addMember}
                disabled={!newMember.name || !newMember.email || !newMember.password}
                className="flex-1 py-2.5 bg-[#25d366] text-white rounded-lg text-sm font-medium hover:bg-[#20bd5a] transition disabled:opacity-50"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add WhatsApp Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Add WhatsApp Number</h3>
              <button onClick={() => setShowAddAccount(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newAccount.phoneNumber}
                  onChange={(e) => setNewAccount({ ...newAccount, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#25d366] text-gray-900"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
                <input
                  type="text"
                  value={newAccount.phoneNumberId}
                  onChange={(e) => setNewAccount({ ...newAccount, phoneNumberId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#25d366] text-gray-900"
                  placeholder="From Meta Business dashboard"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WABA ID</label>
                <input
                  type="text"
                  value={newAccount.wabaId}
                  onChange={(e) => setNewAccount({ ...newAccount, wabaId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#25d366] text-gray-900"
                  placeholder="WhatsApp Business Account ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
                <input
                  type="password"
                  value={newAccount.accessToken}
                  onChange={(e) => setNewAccount({ ...newAccount, accessToken: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#25d366] text-gray-900"
                  placeholder="Permanent access token"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={newAccount.businessName}
                  onChange={(e) => setNewAccount({ ...newAccount, businessName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#25d366] text-gray-900"
                  placeholder="Your business name"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddAccount(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={addAccount}
                disabled={!newAccount.phoneNumber || !newAccount.phoneNumberId || !newAccount.accessToken}
                className="flex-1 py-2.5 bg-[#25d366] text-white rounded-lg text-sm font-medium hover:bg-[#20bd5a] transition disabled:opacity-50"
              >
                Connect Number
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
