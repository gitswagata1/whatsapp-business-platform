"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Send,
  BarChart3,
  Bot,
  Settings,
  LogOut,
  Menu,
  Workflow,
  X,
  ChevronDown,
  Headphones,
  Bell,
  Shield,
} from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { useState } from "react";

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inbox", href: "/inbox", icon: MessageSquare, badge: true },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Broadcasts", href: "/broadcasts", icon: Send },
];

const automationNav = [
  { name: "Bot Studio", href: "/bot-studio", icon: Workflow },
  { name: "AI Agents", href: "/ai-agents", icon: Bot },
];

const insightsNav = [
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "AI Governance", href: "/governance", icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, user } = useStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const NavItem = ({ item }: { item: { name: string; href: string; icon: React.ComponentType<{ size?: number; className?: string }>; badge?: boolean } }) => {
    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
          isActive
            ? "bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-l-2 border-emerald-400 -ml-[2px] pl-[14px]"
            : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
        )}
      >
        <item.icon size={18} className={isActive ? "text-emerald-400" : ""} />
        <span className="flex-1">{item.name}</span>
        {item.badge && (
          <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            3
          </span>
        )}
      </Link>
    );
  };

  const NavSection = ({ title, items }: { title: string; items: typeof mainNav }) => (
    <div className="mb-4">
      <p className="px-3 mb-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-gray-900 text-white shadow-lg"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[250px] bg-[#0f1419] text-white flex flex-col border-r border-white/5",
          "transform transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-500/20">
              MT
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-sm text-white leading-tight">Acme Co</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-medium">PRO PLAN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <NavSection title="Main" items={mainNav} />
          <NavSection title="Automation" items={automationNav} />
          <NavSection title="Insights" items={insightsNav} />

          <div className="mb-4">
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              System
            </p>
            <NavItem item={{ name: "Settings", href: "/settings", icon: Settings }} />
          </div>
        </nav>

        {/* Connected Number */}
        <div className="px-4 py-3 border-t border-white/5">
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-white/5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Headphones size={14} className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400">WhatsApp Connected</p>
              <p className="text-xs text-white font-medium">+91 90560 06634</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        </div>

        {/* User Profile */}
        <div className="px-4 py-3 border-t border-white/5 relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold shadow-lg">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate text-white">{user?.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.role}</p>
            </div>
            <ChevronDown size={14} className="text-gray-500" />
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#1a1f26] rounded-lg border border-white/10 shadow-xl overflow-hidden">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
