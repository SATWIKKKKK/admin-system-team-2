import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MEETINGS, MEMBERS, DOMAINS, DOMAIN_COLORS } from "@/data/mockData";
import {
  CalendarClock,
  Users,
  Sparkles,
  Clock,
  MapPin,
  ArrowRight,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { user, isAdmin } = useAuth();

  const upcomingMeetings = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return MEETINGS.filter((m) => m.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 6);
  }, []);

  const stats = useMemo(() => ({
    totalMembers: MEMBERS.length,
    totalDomains: DOMAINS.length,
    upcomingMeetings: upcomingMeetings.length,
    leads: MEMBERS.filter((m) => m.role === "Lead").length,
  }), [upcomingMeetings]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

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
      {/* Hero greeting */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
            {greeting},{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              {user?.name}
            </span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {isAdmin
              ? "Here's what's happening across your team today."
              : `Manage your ${user?.domain || "domain"} team efficiently.`}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: stats.totalMembers, icon: Users, color: "from-blue-500 to-cyan-500", shadow: "shadow-blue-500/20" },
          { label: "Active Domains", value: stats.totalDomains, icon: Zap, color: "from-violet-500 to-purple-500", shadow: "shadow-violet-500/20" },
          { label: "Domain Leads", value: stats.leads, icon: Sparkles, color: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20" },
          { label: "Upcoming Meetings", value: stats.upcomingMeetings, icon: CalendarClock, color: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/20" },
        ].map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden group hover:border-white/20 transition-all duration-300">
            <CardContent className="p-5">
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg ${stat.shadow} mb-3`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </Card>
        ))}
      </motion.div>

      {/* Upcoming Meetings */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Upcoming Meetings
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your scheduled meetings for the coming days
            </p>
          </div>
          <Link
            to="/meetings"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {upcomingMeetings.map((meeting, i) => {
            const creator = MEMBERS.find((m) => m.id === meeting.createdBy);
            const color = DOMAIN_COLORS[meeting.domain] || "#8b5cf6";
            return (
              <motion.div
                key={meeting.id}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full hover:border-white/20 transition-all duration-300 overflow-hidden group">
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge
                        className="text-[10px] px-2 py-0.5"
                        style={{ backgroundColor: `${color}20`, color: color, borderColor: `${color}40` }}
                      >
                        {meeting.domain}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {meeting.time}
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm mb-1.5 group-hover:text-primary transition-colors">
                      {meeting.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {meeting.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[9px]">
                            {creator?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{creator?.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(meeting.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Domain overview */}
      {isAdmin && (
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Domain Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {DOMAINS.map((domain) => {
              const count = MEMBERS.filter((m) => m.domain === domain).length;
              const color = DOMAIN_COLORS[domain];
              return (
                <Card
                  key={domain}
                  className="hover:border-white/20 transition-all duration-300 group cursor-pointer"
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className="h-10 w-10 rounded-xl mx-auto mb-2 flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                    </div>
                    <p className="text-xs font-medium truncate">{domain}</p>
                    <p className="text-lg font-bold mt-0.5" style={{ color }}>{count}</p>
                    <p className="text-[10px] text-muted-foreground">members</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
