import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MEMBERS, PROJECTS, ATTENDANCE, DOMAINS, DOMAIN_COLORS, PERFORMANCE_DATA } from "@/data/mockData";
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Award,
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  LineChart,
  Line,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-card border rounded-lg p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const domainStats = useMemo(() => {
    return DOMAINS.map((domain) => {
      const members = MEMBERS.filter((m) => m.domain === domain);
      const projects = PROJECTS.filter((p) => p.domain === domain);
      const completed = projects.filter((p) => p.status === "Completed").length;
      const memberIds = members.map((m) => m.id);
      const attendanceRecords = ATTENDANCE.filter((a) => memberIds.includes(a.memberId));
      const presentCount = attendanceRecords.filter((a) => a.status === "Present").length;
      const attendanceRate = attendanceRecords.length > 0 ? Math.round((presentCount / attendanceRecords.length) * 100) : 0;
      const completionRate = projects.length > 0 ? Math.round((completed / projects.length) * 100) : 0;

      return {
        domain,
        shortName: domain.length > 12 ? domain.substring(0, 12) + "…" : domain,
        members: members.length,
        projects: projects.length,
        completed,
        attendanceRate,
        completionRate,
        color: DOMAIN_COLORS[domain],
      };
    });
  }, []);

  const radarData = useMemo(() =>
    domainStats.slice(0, 8).map((d) => ({
      domain: d.shortName,
      attendance: d.attendanceRate,
      completion: d.completionRate,
    })),
  [domainStats]);

  const roleDistribution = useMemo(() => {
    const roles = { Admin: 0, Lead: 0, Member: 0 };
    MEMBERS.forEach((m) => { roles[m.role] = (roles[m.role] || 0) + 1; });
    return [
      { name: "Admins", value: roles.Admin || 1, fill: "#ef4444" },
      { name: "Leads", value: roles.Lead, fill: "#8b5cf6" },
      { name: "Members", value: roles.Member, fill: "#06b6d4" },
    ];
  }, []);

  const topPerformers = useMemo(() => {
    return MEMBERS.map((member) => {
      const memberProjects = PROJECTS.filter((p) => p.memberId === member.id);
      const completed = memberProjects.filter((p) => p.status === "Completed").length;
      const memberAttendance = ATTENDANCE.filter((a) => a.memberId === member.id);
      const present = memberAttendance.filter((a) => a.status === "Present").length;
      const attendanceRate = memberAttendance.length > 0 ? Math.round((present / memberAttendance.length) * 100) : 0;
      const score = completed * 30 + attendanceRate;
      return { ...member, completed, attendanceRate, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Performance Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          In-depth insights into team performance across all domains
        </p>
      </motion.div>

      {/* Summary stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Avg Attendance", value: `${Math.round(domainStats.reduce((s, d) => s + d.attendanceRate, 0) / domainStats.length)}%`, icon: Activity, color: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/20" },
          { label: "Avg Completion", value: `${Math.round(domainStats.reduce((s, d) => s + d.completionRate, 0) / domainStats.length)}%`, icon: Target, color: "from-violet-500 to-purple-500", shadow: "shadow-violet-500/20" },
          { label: "Active Domains", value: DOMAINS.length, icon: TrendingUp, color: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20" },
          { label: "Top Performers", value: topPerformers.filter((t) => t.score > 80).length, icon: Award, color: "from-pink-500 to-rose-500", shadow: "shadow-pink-500/20" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg ${stat.shadow} mb-3`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Domain Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={domainStats} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                    <XAxis type="number" stroke="#71717a" fontSize={11} domain={[0, 100]} />
                    <YAxis dataKey="shortName" type="category" stroke="#71717a" fontSize={10} width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="attendanceRate" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Attendance %" barSize={8} />
                    <Bar dataKey="completionRate" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Completion %" barSize={8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Radar — Domain Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="domain" stroke="#71717a" fontSize={10} />
                    <PolarRadiusAxis stroke="#71717a" fontSize={10} domain={[0, 100]} />
                    <Radar name="Attendance" dataKey="attendance" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                    <Radar name="Completion" dataKey="completion" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Role Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="#09090b"
                    >
                      {roleDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4">
                {roleDistribution.map((r) => (
                  <div key={r.name} className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.fill }} />
                    <span className="text-xs text-muted-foreground">{r.name} ({r.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Attendance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={PERFORMANCE_DATA.monthlyAttendance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} domain={[60, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: "#8b5cf6", r: 5 }} name="Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top performers */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
              {topPerformers.map((member, i) => {
                const color = DOMAIN_COLORS[member.domain] || "#8b5cf6";
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:border-white/20 transition-all"
                  >
                    <div className="relative">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: `${color}25`, color }}
                      >
                        {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      {i < 3 && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-black">{i + 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{member.domain}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="success" className="text-[9px] px-1 py-0">{member.completed} done</Badge>
                        <Badge className="text-[9px] px-1 py-0">{member.attendanceRate}% att.</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Domain breakdown table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Domain Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium">Domain</th>
                    <th className="text-center py-3 px-2 text-xs text-muted-foreground font-medium">Members</th>
                    <th className="text-center py-3 px-2 text-xs text-muted-foreground font-medium">Projects</th>
                    <th className="text-center py-3 px-2 text-xs text-muted-foreground font-medium">Completed</th>
                    <th className="text-center py-3 px-2 text-xs text-muted-foreground font-medium">Attendance</th>
                    <th className="text-center py-3 px-2 text-xs text-muted-foreground font-medium">Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {domainStats.map((d) => (
                    <tr key={d.domain} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-xs font-medium">{d.domain}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-2 text-xs">{d.members}</td>
                      <td className="text-center py-3 px-2 text-xs">{d.projects}</td>
                      <td className="text-center py-3 px-2 text-xs">{d.completed}</td>
                      <td className="text-center py-3 px-2">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${d.attendanceRate}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-8">{d.attendanceRate}%</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-2">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${d.completionRate}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-8">{d.completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
