import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import { Search, Bell, Settings } from "lucide-react";

export default function AppLayout() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const displayRole = user?.role === "Admin" ? "SYSTEM ADMIN" : user?.role === "Lead" ? "LEAD ADMIN" : user?.role?.toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-4 lg:px-8 py-3 bg-[#111111] border-b border-white/10">
          {/* Search */}
          <div className="relative w-full sm:w-[40%] ml-8 sm:ml-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search for projects, members..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#1a1a1a] border border-white/10 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#f59e0b]/50 focus:ring-1 focus:ring-[#f59e0b]/30 transition-colors"
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 sm:gap-4 sm:ml-auto">
            <button className="p-2 rounded-lg text-gray-400 hover:text-[#f59e0b] hover:bg-white/5 transition-colors relative cursor-pointer" title="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#f59e0b]" />
            </button>
            <button className="p-2 rounded-lg text-gray-400 hover:text-[#f59e0b] hover:bg-white/5 transition-colors cursor-pointer" title="Settings">
              <Settings className="h-5 w-5" />
            </button>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white leading-tight">{user?.name}</p>
                <p className="text-[10px] text-[#f59e0b] uppercase tracking-wider font-semibold">{displayRole}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-[#f59e0b]/20 flex items-center justify-center shrink-0 ring-2 ring-[#f59e0b]/30">
                <span className="text-[#f59e0b] text-xs font-bold">{initials}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8 pt-6 lg:pt-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
