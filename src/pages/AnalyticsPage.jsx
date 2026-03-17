import { MEMBERS, PROJECTS, DOMAINS, PERFORMANCE_DATA } from "@/data/mockData";
import { Users, LayoutGrid, UserCheck, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const ACCENT = "#f59e0b";

const domainBarData = [
  { name: "WEB", value: 85 },
  { name: "AI/ML", value: 72 },
  { name: "APP", value: 60 },
  { name: "CYBER", value: 55 },
  { name: "CLOUD", value: 68 },
  { name: "IOT", value: 45 },
];

const attendanceLineData = [
  { week: "Week 1", core: 90, general: 70 },
  { week: "Week 2", core: 85, general: 75 },
  { week: "Week 3", core: 92, general: 68 },
  { week: "Week 4", core: 88, general: 80 },
];

const activeProjects = [
  { name: "CyberSec Lab v2", lead: "Marcus Chen", domain: "Cybersecurity", progress: 75 },
  { name: "Autonomous Drone Swarm", lead: "Sarah Jenkins", domain: "AI & Robotics", progress: 40 },
  { name: "Global Hackathon Portal", lead: "Leo Rodriguez", domain: "Web Dev", progress: 95 },
];

const statsCards = [
  { label: "Total Members", value: "1,240", change: "+12%", up: true, icon: Users },
  { label: "Total Domains", value: "8", change: "0%", up: null, icon: LayoutGrid },
  { label: "Attendance Rate", value: "92%", change: "+5%", up: true, icon: UserCheck },
  { label: "Projects Submitted", value: "145", change: "-2%", up: false, icon: FolderOpen },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 shadow-xl">
      <p className="mb-1 text-xs text-gray-400">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AnalyticsPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white">Analytics Overview</h1>
        <p className="mt-1 text-sm text-gray-400">
          Real-time performance metrics for the current semester.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statsCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/10 bg-[#141414] p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-gray-400">{stat.label}</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
                <stat.icon className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="mt-3">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                  stat.up === true
                    ? "bg-emerald-500/15 text-emerald-400"
                    : stat.up === false
                    ? "bg-red-500/15 text-red-400"
                    : "bg-gray-500/15 text-gray-400"
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Domain Performance */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-white/10 bg-[#141414] p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              Domain Performance
            </h2>
            <select className="rounded-md border border-white/10 bg-[#1a1a1a] px-2 py-1 text-xs text-gray-300 outline-none">
              <option>Current Month</option>
            </select>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="value" fill={ACCENT} radius={[4, 4, 0, 0]} barSize={32} name="Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Attendance Statistics */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-white/10 bg-[#141414] p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              Attendance Statistics
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
                CORE
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-400" />
                GENERAL
              </span>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceLineData}>
                <defs>
                  <linearGradient id="coreFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="generalFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#9ca3af" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="week" stroke="#71717a" fontSize={12} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="core"
                  stroke={ACCENT}
                  strokeWidth={2}
                  fill="url(#coreFill)"
                  name="CORE"
                />
                <Area
                  type="monotone"
                  dataKey="general"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  fill="url(#generalFill)"
                  name="GENERAL"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Active Projects Table */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl border border-white/10 bg-[#141414] p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Active Projects</h2>
          <button className="text-sm font-medium text-amber-500 hover:underline">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Project Name
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Lead
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Domain
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody>
              {activeProjects.map((project) => (
                <tr
                  key={project.name}
                  className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-3 py-3 font-medium text-white">
                    {project.name}
                  </td>
                  <td className="px-3 py-3 text-gray-400">{project.lead}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                      {project.domain}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
