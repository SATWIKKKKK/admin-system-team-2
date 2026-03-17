import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  FolderKanban,
  CalendarClock,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  ChevronLeft,
  Plus,
} from "lucide-react";

const adminLinks = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/members", icon: Users, label: "Members" },
  { to: "/attendance", icon: ClipboardCheck, label: "Attendance" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/meetings", icon: CalendarClock, label: "Meetings" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
];

const leadLinks = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/members", icon: Users, label: "Members" },
  { to: "/attendance", icon: ClipboardCheck, label: "Attendance" },
  { to: "/meetings", icon: CalendarClock, label: "Meetings" },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = isAdmin ? adminLinks : leadLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sidebarContent = (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#111111" }}>
      {/* Branding */}
      <div className={cn("flex items-center gap-3 px-4 py-5", collapsed && "justify-center px-2")}>
        <div className="h-10 w-10 rounded-full border-2 border-[#f59e0b] flex items-center justify-center shrink-0">
          <span className="text-[#f59e0b] font-bold text-sm">&lt;&gt;</span>
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm tracking-tight">TechClub</span>
            <span className="text-[10px] text-[#f59e0b] uppercase tracking-widest font-semibold">
              Admin Panel
            </span>
          </div>
        )}
      </div>

      <div className="mx-4 border-t border-white/10" />

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              )
            }
          >
            <link.icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}

        {/* Settings — separated at bottom of nav */}
        <div className="!mt-auto pt-4">
          <div className="border-t border-white/10 pt-3">
            <NavLink
              to="/settings"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                )
              }
            >
              <Settings className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>Settings</span>}
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Bottom section */}
      <div className={cn("px-3 pb-4 space-y-3", collapsed && "px-2")}>
        {/* New Project button */}
        {!collapsed && (
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#f59e0b] text-black text-sm font-semibold hover:bg-[#d97706] transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center justify-center w-full py-2.5 rounded-lg bg-[#f59e0b] text-black hover:bg-[#d97706] transition-colors cursor-pointer"
            title="New Project"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}

        <div className="border-t border-white/10" />

        {/* User info */}
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="h-9 w-9 rounded-full bg-[#f59e0b]/20 flex items-center justify-center shrink-0">
            <span className="text-[#f59e0b] text-xs font-bold">{initials}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-[#f59e0b] uppercase tracking-wider font-semibold truncate">
                {user?.role === "Admin" ? "System Admin" : user?.role}
              </p>
            </div>
          )}
          {!collapsed && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => navigate("/settings")}
                className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors cursor-pointer"
                title="Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleLogout}
                className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        {collapsed && (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full py-2 rounded-md text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-[#111111] border border-white/10 shadow-lg cursor-pointer"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <Menu className="h-5 w-5 text-white" />
        )}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-all duration-300 overflow-hidden",
          collapsed ? "w-[68px]" : "w-[250px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ backgroundColor: "#111111" }}
      >
        {sidebarContent}

        {/* Collapse toggle (desktop) */}
        <button
          className="absolute -right-3 top-7 hidden lg:flex h-6 w-6 items-center justify-center rounded-full border border-white/20 shadow-md transition-colors cursor-pointer"
          style={{ backgroundColor: "#1a1a1a" }}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={cn(
              "h-3 w-3 text-gray-400 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </aside>

      {/* Spacer */}
      <div
        className={cn(
          "hidden lg:block shrink-0 transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[250px]"
        )}
      />
    </>
  );
}
