import { useMemo } from "react";
import { MEMBERS, MEETINGS, PROJECTS, ATTENDANCE, DOMAINS, PERFORMANCE_DATA } from "@/data/mockData";
import {
  Users,
  FolderKanban,
  CalendarClock,
  ClipboardCheck,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";

const ACCENT = "#f59e0b";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 shadow-xl">
      <p className="mb-1 text-xs text-gray-400">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
          {entry.name?.includes("rate") || entry.name?.includes("ttendance") ? "%" : ""}
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

export default function DashboardPage() {
  const stats = useMemo(() => {
    const completedProjects = PROJECTS.filter((p) => p.status === "Completed").length;
    const totalAttendance = ATTENDANCE.length;
    const presentCount = ATTENDANCE.filter((a) => a.status === "Present").length;
    return {
      members: MEMBERS.length,
      projects: PROJECTS.length,
      completedProjects,
      meetings: MEETINGS.length,
      attendanceRate: Math.round((presentCount / totalAttendance) * 100),
      completionRate: Math.round((completedProjects / PROJECTS.length) * 100),
    };
  }, []);

  const domainMemberCounts = useMemo(
    () =>
      DOMAINS.map((d) => ({
        domain: d.length > 12 ? d.substring(0, 12) + "…" : d,
        fullName: d,
        members: MEMBERS.filter((m) => m.domain === d).length,
      })).sort((a, b) => b.members - a.members),
    [],
  );

  const statCards = [
    { label: "Total Members", value: stats.members, icon: Users, change: "+3", up: true },
    { label: "Projects", value: stats.projects, icon: FolderKanban, change: `${stats.completionRate}% done`, up: true },
    { label: "Meetings", value: stats.meetings, icon: CalendarClock, change: "+2 this week", up: true },
    { label: "Attendance Rate", value: `${stats.attendanceRate}%`, icon: ClipboardCheck, change: "+5%", up: true },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">
          Overview of your team's performance and activity
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((stat) => (
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
                  stat.up
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Monthly Attendance Trend */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 rounded-xl border border-white/10 bg-[#141414] p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-semibold text-white">
              Monthly Attendance Trend
            </h2>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE_DATA.monthlyAttendance}>
                <defs>
                  <linearGradient id="dashAttendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} domain={[60, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke={ACCENT}
                  strokeWidth={2}
                  fill="url(#dashAttendGrad)"
                  name="Attendance"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Project Status */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-white/10 bg-[#141414] p-5"
        >
          <h2 className="mb-4 text-base font-semibold text-white">
            Project Status
          </h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PERFORMANCE_DATA.projectStatusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#141414"
                >
                  {PERFORMANCE_DATA.projectStatusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-4">
            {PERFORMANCE_DATA.projectStatusBreakdown.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-xs text-gray-400">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Members by Domain */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-white/10 bg-[#141414] p-5"
        >
          <h2 className="mb-4 text-base font-semibold text-white">
            Members by Domain
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={domainMemberCounts}
                layout="vertical"
                margin={{ left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={12} tickLine={false} />
                <YAxis
                  dataKey="domain"
                  type="category"
                  stroke="#71717a"
                  fontSize={10}
                  width={100}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar
                  dataKey="members"
                  fill={ACCENT}
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                  name="Members"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weekly Activity */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-white/10 bg-[#141414] p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              Weekly Activity
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
                Meetings
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500/40" />
                Submissions
              </span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PERFORMANCE_DATA.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="meetings" fill={ACCENT} radius={[4, 4, 0, 0]} barSize={20} name="Meetings" />
                <Bar dataKey="submissions" fill="#d97706" radius={[4, 4, 0, 0]} barSize={20} name="Submissions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Submissions Table */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl border border-white/10 bg-[#141414] p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            Recent Project Submissions
          </h2>
          <span className="text-sm font-medium text-amber-500">
            {stats.completedProjects} completed
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Project
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Member
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Domain
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {PROJECTS.filter((p) => p.status === "Completed")
                .sort((a, b) => b.submissionDate.localeCompare(a.submissionDate))
                .slice(0, 5)
                .map((project) => {
                  const member = MEMBERS.find((m) => m.id === project.memberId);
                  return (
                    <tr
                      key={project.id}
                      className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-3 py-3 font-medium text-white">
                        {project.projectTitle}
                      </td>
                      <td className="px-3 py-3 text-gray-400">
                        {member?.name}
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                          {project.domain}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-400">
                        {new Date(project.submissionDate).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                          Completed
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
