import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  FolderKanban,
  CalendarClock,
  BarChart3,
  LogOut,
  Menu,
  X,
  Shield,
  Home,
  ChevronLeft,
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
  { to: "/members", icon: Users, label: "My Domain" },
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
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5", collapsed && "justify-center px-2")}>
        <div className="relative">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-sidebar animate-pulse" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-foreground text-sm tracking-tight">AdminHub</span>
            <span className="text-[10px] text-muted-foreground">Team Management</span>
          </div>
        )}
      </div>

      <Separator className="opacity-50" />

      {/* Nav links */}
      <nav className="flex-1 px-2 py-4 space-y-1">
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
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )
            }
          >
            <link.icon className={cn("h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110")} />
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      <Separator className="opacity-50" />

      {/* User section */}
      <div className={cn("p-3", collapsed && "px-2")}>
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-lg bg-muted/40",
          collapsed && "justify-center p-1"
        )}>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.role}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive", collapsed && "h-6 w-6")}
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card border shadow-lg cursor-pointer"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[240px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}

        {/* Collapse toggle (desktop) */}
        <button
          className="absolute -right-3 top-7 hidden lg:flex h-6 w-6 items-center justify-center rounded-full border bg-card shadow-md hover:bg-muted transition-colors cursor-pointer"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* Spacer */}
      <div className={cn("hidden lg:block shrink-0 transition-all duration-300", collapsed ? "w-[68px]" : "w-[240px]")} />
    </>
  );
}
