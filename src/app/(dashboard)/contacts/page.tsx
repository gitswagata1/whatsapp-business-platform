"use client";

import { useState, useEffect } from "react";
import { formatPhoneNumber, timeAgo, getInitials } from "@/lib/utils";
import {
  Search,
  Plus,
  Upload,
  Tag,
  MoreVertical,
  Phone,
  Mail,
  X,
  Users,
  Filter,
} from "lucide-react";

type Contact = {
  id: string;
  phoneNumber: string;
  name: string | null;
  email: string | null;
  source: string | null;
  isOptedIn: boolean;
  createdAt: string;
  tags: { tag: { id: string; name: string; color: string } }[];
  _count?: { conversations: number };
};

type TagData = {
  id: string;
  name: string;
  color: string;
  _count: { contacts: number };
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tags, setTags] = useState<TagData[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newContact, setNewContact] = useState({ phoneNumber: "", name: "", email: "" });
  const [newTag, setNewTag] = useState({ name: "", color: "#6366f1" });

  const fetchContacts = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedTag) params.set("tag", selectedTag);

    const res = await fetch(`/api/contacts?${params}`);
    if (res.ok) {
      const data = await res.json();
      setContacts(data.contacts);
      setTotal(data.total);
    }
  };

  const fetchTags = async () => {
    const res = await fetch("/api/contacts/tags");
    if (res.ok) setTags(await res.json());
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount; state is set after the request resolves
    fetchContacts();
    fetchTags();
  }, [search, selectedTag]);

  const addContact = async () => {
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newContact),
    });
    if (res.ok) {
      setShowAddModal(false);
      setNewContact({ phoneNumber: "", name: "", email: "" });
      fetchContacts();
    }
  };

  const addTag = async () => {
    const res = await fetch("/api/contacts/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTag),
    });
    if (res.ok) {
      setShowTagModal(false);
      setNewTag({ name: "", color: "#6366f1" });
      fetchTags();
    }
  };

  const deleteContact = async (id: string) => {
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    fetchContacts();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total contacts</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTagModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <Tag size={16} />
            Manage Tags
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#25d366] text-white rounded-lg text-sm font-medium hover:bg-[#20bd5a] transition"
          >
            <Plus size={16} />
            Add Contact
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#25d366] text-gray-900"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Filter size={16} className="text-gray-400" />
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="text-sm px-3 py-2.5 border border-gray-200 rounded-lg outline-none text-gray-700"
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.name}>
                {tag.name} ({tag._count.contacts})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags Overview */}
      {tags.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(selectedTag === tag.name ? "" : tag.name)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition border"
              style={{
                backgroundColor: selectedTag === tag.name ? tag.color + "20" : "white",
                borderColor: selectedTag === tag.name ? tag.color : "#e5e7eb",
                color: selectedTag === tag.name ? tag.color : "#6b7280",
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
              {tag.name}
              <span className="text-gray-400 ml-0.5">{tag._count.contacts}</span>
            </button>
          ))}
        </div>
      )}

      {/* Contacts Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tags</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Added</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#075e54] flex items-center justify-center text-white text-xs font-medium">
                      {getInitials(contact.name || contact.phoneNumber)}
                    </div>
                    <span className="font-medium text-sm text-gray-900">
                      {contact.name || "Unknown"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatPhoneNumber(contact.phoneNumber)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {contact.email || "-"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {contact.tags.map((t) => (
                      <span
                        key={t.tag.id}
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: t.tag.color + "20", color: t.tag.color }}
                      >
                        {t.tag.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                  {contact.source || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {timeAgo(contact.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition"
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {contacts.length === 0 && (
          <div className="py-16 text-center">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No contacts found</p>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Add Contact</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={newContact.phoneNumber}
                    onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#25d366] text-gray-900"
                    placeholder="919876543210"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#25d366] text-gray-900"
                  placeholder="Contact name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#25d366] text-gray-900"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={addContact}
                disabled={!newContact.phoneNumber}
                className="flex-1 py-2.5 bg-[#25d366] text-white rounded-lg text-sm font-medium hover:bg-[#20bd5a] transition disabled:opacity-50"
              >
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Manage Tags</h3>
              <button onClick={() => setShowTagModal(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                    <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{tag._count.contacts} contacts</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Create New Tag</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#25d366] text-gray-900"
                  placeholder="Tag name"
                />
                <input
                  type="color"
                  value={newTag.color}
                  onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0"
                />
                <button
                  onClick={addTag}
                  disabled={!newTag.name}
                  className="px-4 py-2.5 bg-[#25d366] text-white rounded-lg text-sm font-medium hover:bg-[#20bd5a] transition disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
