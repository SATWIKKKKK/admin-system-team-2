import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MEMBERS, MEETINGS, PROJECTS, ATTENDANCE, DOMAINS, DOMAIN_COLORS, PERFORMANCE_DATA } from "@/data/mockData";
import {
  Users,
  FolderKanban,
  CalendarClock,
  ClipboardCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
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

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-card border rounded-lg p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
          {entry.name?.includes("rate") || entry.name?.includes("ttendance") ? "%" : ""}
        </p>
      ))}
    </div>
  );
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
      activeDomains: DOMAINS.length,
      leads: MEMBERS.filter((m) => m.role === "Lead").length,
    };
  }, []);

  const domainMemberCounts = useMemo(() =>
    DOMAINS.map((d) => ({
      domain: d.length > 10 ? d.substring(0, 10) + "…" : d,
      fullName: d,
      members: MEMBERS.filter((m) => m.domain === d).length,
      fill: DOMAIN_COLORS[d],
    })).sort((a, b) => b.members - a.members),
  []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const statCards = [
    { label: "Total Members", value: stats.members, icon: Users, change: "+3", up: true, color: "from-blue-500 to-cyan-500", shadow: "shadow-blue-500/20" },
    { label: "Projects", value: stats.projects, icon: FolderKanban, change: `${stats.completionRate}% done`, up: true, color: "from-violet-500 to-purple-500", shadow: "shadow-violet-500/20" },
    { label: "Meetings", value: stats.meetings, icon: CalendarClock, change: "+2 this week", up: true, color: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20" },
    { label: "Attendance Rate", value: `${stats.attendanceRate}%`, icon: ClipboardCheck, change: "+5%", up: true, color: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/20" },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your team's performance and activity
        </p>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden group hover:border-white/20 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg ${stat.shadow}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
                <div className={`flex items-center gap-0.5 text-xs ${stat.up ? "text-emerald-400" : "text-red-400"}`}>
                  {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Monthly Attendance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PERFORMANCE_DATA.monthlyAttendance}>
                    <defs>
                      <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} domain={[60, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="rate" stroke="#8b5cf6" fill="url(#attendGrad)" strokeWidth={2} name="Attendance" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Project Status</CardTitle>
            </CardHeader>
            <CardContent>
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
                      stroke="#09090b"
                    >
                      {PERFORMANCE_DATA.projectStatusBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {PERFORMANCE_DATA.projectStatusBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Members by Domain</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={domainMemberCounts} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                    <XAxis type="number" stroke="#71717a" fontSize={12} />
                    <YAxis dataKey="domain" type="category" stroke="#71717a" fontSize={10} width={90} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="members" radius={[0, 6, 6, 0]} name="Members">
                      {domainMemberCounts.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PERFORMANCE_DATA.weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="day" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="meetings" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Meetings" />
                    <Bar dataKey="submissions" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Submissions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent activity */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Project Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PROJECTS.filter((p) => p.status === "Completed")
                .sort((a, b) => b.submissionDate.localeCompare(a.submissionDate))
                .slice(0, 5)
                .map((project) => {
                  const member = MEMBERS.find((m) => m.id === project.memberId);
                  return (
                    <div key={project.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <FolderKanban className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{project.projectTitle}</p>
                          <p className="text-xs text-muted-foreground">{member?.name} • {project.domain}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="success" className="text-[10px]">Completed</Badge>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(project.submissionDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
