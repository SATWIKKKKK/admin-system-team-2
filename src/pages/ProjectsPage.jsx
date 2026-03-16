import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PROJECTS as INITIAL_PROJECTS, MEMBERS, DOMAINS, DOMAIN_COLORS } from "@/data/mockData";
import {
  FolderKanban,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const statusConfig = {
  Completed: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", badge: "success" },
  "In Progress": { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", badge: "warning" },
  Pending: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", badge: "destructive" },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
        MEMBERS.find((m) => m.id === p.memberId)?.name.toLowerCase().includes(search.toLowerCase());
      const matchDomain = domainFilter === "all" || p.domain === domainFilter;
      const matchStatus = activeTab === "all" || p.status === activeTab;
      return matchSearch && matchDomain && matchStatus;
    });
  }, [projects, search, domainFilter, activeTab]);

  const stats = useMemo(() => ({
    total: projects.length,
    completed: projects.filter((p) => p.status === "Completed").length,
    inProgress: projects.filter((p) => p.status === "In Progress").length,
    pending: projects.filter((p) => p.status === "Pending").length,
  }), [projects]);

  const updateStatus = (projectId, newStatus) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              status: newStatus,
              submissionDate: newStatus === "Completed" ? new Date().toISOString().split("T")[0] : p.submissionDate,
            }
          : p
      )
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FolderKanban className="h-6 w-6 text-primary" />
          Project Tracking
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor and manage project submissions across domains
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, config: { color: "text-blue-400", bg: "bg-blue-500/10" } },
          { label: "Completed", value: stats.completed, config: statusConfig.Completed },
          { label: "In Progress", value: stats.inProgress, config: statusConfig["In Progress"] },
          { label: "Pending", value: stats.pending, config: statusConfig.Pending },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${s.config.bg} flex items-center justify-center`}>
                <FolderKanban className={`h-5 w-5 ${s.config.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects or members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(search || domainFilter !== "all") && (
                <Button variant="ghost" size="icon" onClick={() => { setSearch(""); setDomainFilter("all"); }}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs + Projects */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="Completed">Completed ({stats.completed})</TabsTrigger>
            <TabsTrigger value="In Progress">In Progress ({stats.inProgress})</TabsTrigger>
            <TabsTrigger value="Pending">Pending ({stats.pending})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((project) => {
                  const member = MEMBERS.find((m) => m.id === project.memberId);
                  const color = DOMAIN_COLORS[project.domain] || "#8b5cf6";
                  const config = statusConfig[project.status];
                  const StatusIcon = config.icon;
                  const initials = member?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "??";

                  return (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className={`hover:border-white/20 transition-all duration-300 overflow-hidden ${config.border}`}>
                        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}66)` }} />
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <Badge
                              className="text-[10px]"
                              style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40` }}
                            >
                              {project.domain}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <StatusIcon className={`h-3.5 w-3.5 ${config.color}`} />
                              <Badge variant={config.badge} className="text-[10px]">
                                {project.status}
                              </Badge>
                            </div>
                          </div>

                          <h3 className="font-semibold text-sm mb-3">{project.projectTitle}</h3>

                          <div className="flex items-center gap-2 mb-3">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[9px]" style={{ backgroundColor: `${color}25`, color }}>
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{member?.name}</span>
                          </div>

                          {project.submissionDate && (
                            <p className="text-[10px] text-muted-foreground mb-3">
                              Submitted: {new Date(project.submissionDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          )}

                          {/* Status update buttons */}
                          <div className="flex gap-2 pt-3 border-t border-border/50">
                            {["Pending", "In Progress", "Completed"].map((status) => (
                              <Button
                                key={status}
                                size="sm"
                                variant={project.status === status ? "default" : "outline"}
                                className={`text-[10px] h-7 flex-1 ${project.status === status ? (status === "Completed" ? "bg-emerald-600 hover:bg-emerald-700" : status === "In Progress" ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700") : ""}`}
                                onClick={() => updateStatus(project.id, status)}
                              >
                                {status}
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <FolderKanban className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No projects found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
