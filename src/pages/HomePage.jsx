import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { MEETINGS, MEMBERS, DOMAINS, DOMAIN_COLORS, PROJECTS, PERFORMANCE_DATA } from "@/data/mockData";
import {
  CalendarDays,
  Clock,
  MapPin,
  ArrowRight,
  FileText,
  Zap,
  Globe,
  Brain,
  Shield,
  Cloud,
  Filter,
  LayoutGrid,
  TrendingUp,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MEETING_BADGES = {
  "Web Development": "GENERAL BODY",
  "AI / ML": "TECH WORKSHOP",
  "Cyber Security": "RESEARCH",
  "UI / UX": "DESIGN SYNC",
  "Cloud Computing": "CLOUD OPS",
  "Android Development": "APP REVIEW",
  "Data Analytics": "DATA SYNC",
  "Content Writing": "CONTENT",
  "IoT & Embedded Systems": "IOT WORKSHOP",
  "Game Development & AR/VR": "GAME DEV",
  Java: "JAVA DEV",
  "Graphic Designing": "DESIGN",
  "Photography & Video Editing": "MEDIA",
  "Marketing & PR": "MARKETING",
};

const DOMAIN_META = {
  "Web Development": { icon: Globe, watermark: "HTML", displayName: "Web Development" },
  "AI / ML": { icon: Brain, watermark: "AI", displayName: "AI & Machine Learning" },
  "Cyber Security": { icon: Shield, watermark: "SEC", displayName: "Cybersecurity" },
  "Cloud Computing": { icon: Cloud, watermark: "OPS", displayName: "DevOps & Cloud" },
};

const FOCUS_DOMAIN_KEYS = ["Web Development", "AI / ML", "Cyber Security", "Cloud Computing"];

const DOMAIN_DESCRIPTIONS = {
  "Web Development": "Building modern web applications with the latest frameworks and tools.",
  "AI / ML": "Exploring artificial intelligence and machine learning innovations.",
  "Cyber Security": "Protecting systems and networks from digital threats and vulnerabilities.",
  "Cloud Computing": "Designing scalable cloud infrastructure and DevOps pipelines.",
};

export default function HomePage() {
  const { user } = useAuth();

  const upcomingMeetings = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return MEETINGS.filter((m) => m.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 3);
  }, []);

  const focusDomains = useMemo(
    () =>
      FOCUS_DOMAIN_KEYS.map((name) => ({
        name,
        color: DOMAIN_COLORS[name],
        members: MEMBERS.filter((m) => m.domain === name),
        projects: PROJECTS.filter((p) => p.domain === name).length,
      })),
    [],
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            Welcome back, {user?.name || "Alex"}!
          </h1>
          <p className="text-gray-400 mt-1">
            You have 3 meetings and 5 pending project reviews today.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button className="px-4 py-2 rounded-lg border border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b]/10 transition-colors text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            View Reports
          </button>
          <button className="px-4 py-2 rounded-lg border border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b]/10 transition-colors text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick Action
          </button>
        </div>
      </motion.div>

      {/* Upcoming Meetings */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[#f59e0b]" />
            Upcoming Meetings
          </h2>
          <Link
            to="/meetings"
            className="text-sm text-[#f59e0b] hover:text-[#f59e0b]/80 flex items-center gap-1 transition-colors"
          >
            See Full Calendar <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {upcomingMeetings.map((meeting) => {
            const color = DOMAIN_COLORS[meeting.domain] || "#f59e0b";
            const badge = MEETING_BADGES[meeting.domain] || meeting.domain.toUpperCase();
            return (
              <motion.div
                key={meeting.id}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="h-full rounded-xl border border-white/10 bg-[#1a1a1a] overflow-hidden group hover:border-white/20 transition-all duration-300">
                  <div className="p-5">
                    <div className="mb-3">
                      <span
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-wider"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        {badge}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <CalendarDays className="h-4 w-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm group-hover:text-[#f59e0b] transition-colors">
                          {meeting.title}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                          {meeting.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(meeting.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        • {meeting.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Online
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Focus Domains */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-[#f59e0b]" />
            Focus Domains
          </h2>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors">
              <Filter className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors">
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {focusDomains.map((domain) => {
            const meta = DOMAIN_META[domain.name];
            const Icon = meta.icon;
            return (
              <motion.div
                key={domain.name}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative rounded-xl border border-white/10 bg-[#1a1a1a] p-5 overflow-hidden group hover:border-white/20 transition-all duration-300">
                  {/* Watermark */}
                  <span className="absolute top-2 right-3 text-4xl font-black text-white/[0.03] select-none pointer-events-none">
                    {meta.watermark}
                  </span>

                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${domain.color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: domain.color }} />
                  </div>

                  <h3 className="font-bold text-white text-sm">{meta.displayName}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {DOMAIN_DESCRIPTIONS[domain.name]}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {domain.members.slice(0, 3).map((member) => (
                          <div
                            key={member.id}
                            className="w-6 h-6 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center text-[8px] font-medium text-white"
                            style={{ backgroundColor: domain.color }}
                          >
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                        ))}
                      </div>
                      {domain.members.length > 3 && (
                        <span className="ml-1.5 text-[10px] text-gray-400 bg-white/5 rounded-full px-1.5 py-0.5">
                          +{domain.members.length - 3}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#f59e0b] font-medium">
                      {domain.projects} Projects
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Bottom Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Member Participation Growth Chart */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#f59e0b]" />
              Member Participation Growth
            </h3>
            <span className="text-xs text-gray-400 bg-white/5 rounded-full px-3 py-1">
              Last 6 Months
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE_DATA.monthlyAttendance}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorRate)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Club Health Score */}
        <div className="rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-5 w-5 text-white/80" />
              <span className="text-xs font-semibold text-white/70 tracking-wider uppercase">
                Performance Metrics
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">Club Health Score</h3>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-white">
              87<span className="text-2xl">%</span>
            </p>
            <p className="text-sm text-white/70 mt-1">Overall performance rating</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-white/10 rounded-lg p-2">
              <p className="text-lg font-bold text-white">91%</p>
              <p className="text-[10px] text-white/60">Attendance</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <p className="text-lg font-bold text-white">83%</p>
              <p className="text-[10px] text-white/60">Projects</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
