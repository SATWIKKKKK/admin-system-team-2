import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MEMBERS as INITIAL_MEMBERS,
  DOMAINS,
  DOMAIN_COLORS,
  ATTENDANCE,
  PROJECTS,
} from "@/data/mockData";
import {
  Users,
  Search,
  Pencil,
  Trash2,
  Filter,
  UserPlus,
  X,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Pre-compute attendance and project maps from mock data
const ATTENDANCE_MAP = (() => {
  const map = {};
  ATTENDANCE.forEach((a) => {
    if (!map[a.memberId]) map[a.memberId] = { present: 0, total: 0 };
    map[a.memberId].total++;
    if (a.status === "Present") map[a.memberId].present++;
  });
  return map;
})();

const PROJECT_MAP = (() => {
  const map = {};
  PROJECTS.forEach((p) => {
    map[p.memberId] = p.status;
  });
  return map;
})();

function getMemberAttendance(memberId) {
  const data = ATTENDANCE_MAP[memberId];
  if (data && data.total > 0)
    return Math.round((data.present / data.total) * 100);
  const num = parseInt(memberId.replace("m", ""), 10) || 0;
  return 70 + ((num * 7 + 3) % 28);
}

function getMemberProjectStatus(memberId) {
  const status = PROJECT_MAP[memberId];
  if (status === "In Progress" || status === "Completed")
    return { text: "Active", color: "#10b981" };
  if (status === "Pending") return { text: "Pending Review", color: "#f59e0b" };
  return { text: "On Leave", color: "#6b7280" };
}

const ITEMS_PER_PAGE = 8;

export default function MembersPage() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    domain: "",
    role: "Member",
  });

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase());
      const matchDomain = domainFilter === "all" || m.domain === domainFilter;
      const matchRole = roleFilter === "all" || m.role === roleFilter;
      return matchSearch && matchDomain && matchRole;
    });
  }, [members, search, domainFilter, roleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, domainFilter, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );
  const startIndex = filtered.length > 0 ? (safePage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const endIndex = Math.min(safePage * ITEMS_PER_PAGE, filtered.length);

  const stats = useMemo(() => {
    const activeProjects = PROJECTS.filter(
      (p) => p.status === "In Progress"
    ).length;
    const pendingRequests = PROJECTS.filter(
      (p) => p.status === "Pending"
    ).length;
    const vals = members.map((m) => getMemberAttendance(m.id));
    const avgAttendance =
      vals.length > 0
        ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
        : "0";
    return { activeProjects, pendingRequests, avgAttendance };
  }, [members]);

  function getPageNumbers() {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (
        let i = Math.max(2, safePage - 1);
        i <= Math.min(totalPages - 1, safePage + 1);
        i++
      )
        pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }

  const openAddDialog = () => {
    setEditingMember(null);
    setForm({ name: "", email: "", phone: "", domain: "", role: "Member" });
    setDialogOpen(true);
  };

  const openEditDialog = (member) => {
    setEditingMember(member);
    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      domain: member.domain,
      role: member.role,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email || !form.domain) return;
    if (editingMember) {
      setMembers((prev) =>
        prev.map((m) => (m.id === editingMember.id ? { ...m, ...form } : m))
      );
    } else {
      const newMember = {
        id: "m" + Date.now(),
        ...form,
        joinDate: new Date().toISOString().split("T")[0],
        avatar: null,
      };
      setMembers((prev) => [...prev, newMember]);
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deletingMember) {
      setMembers((prev) => prev.filter((m) => m.id !== deletingMember.id));
      setDeleteDialogOpen(false);
      setDeletingMember(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  function renderMemberRow(member) {
    const color = DOMAIN_COLORS[member.domain] || "#f59e0b";
    const initials = member.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2);
    const attendance = getMemberAttendance(member.id);
    const projectStatus = getMemberProjectStatus(member.id);

    return (
      <motion.tr
        key={member.id}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="border-b border-gray-800/50 hover:bg-gray-800/40 group transition-colors"
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback
                className="text-xs font-bold"
                style={{ backgroundColor: `${color}25`, color }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm text-white whitespace-nowrap">
              {member.name}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <span className="text-sm text-gray-400">{member.email}</span>
        </td>
        <td className="px-4 py-3">
          <Badge
            className="text-[11px] px-2 py-0.5 whitespace-nowrap"
            style={{
              backgroundColor: `${color}20`,
              color,
              borderColor: `${color}40`,
            }}
          >
            {member.domain}
          </Badge>
        </td>
        <td className="px-4 py-3">
          <span className="text-sm text-gray-300">{member.role}</span>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${attendance}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-8">{attendance}%</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: projectStatus.color }}
            />
            <span className="text-sm" style={{ color: projectStatus.color }}>
              {projectStatus.text}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-white"
              onClick={() => openEditDialog(member)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-red-400"
              onClick={() => {
                setDeletingMember(member);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </td>
      </motion.tr>
    );
  }

  function renderMobileCard(member) {
    const color = DOMAIN_COLORS[member.domain] || "#f59e0b";
    const initials = member.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2);
    const attendance = getMemberAttendance(member.id);
    const projectStatus = getMemberProjectStatus(member.id);

    return (
      <motion.div
        key={member.id}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
      >
        <Card className="bg-gray-900/60 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback
                    className="text-xs font-bold"
                    style={{ backgroundColor: `${color}25`, color }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm text-white">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-400">{member.email}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400"
                  onClick={() => openEditDialog(member)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-red-400"
                  onClick={() => {
                    setDeletingMember(member);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge
                className="text-[10px]"
                style={{
                  backgroundColor: `${color}20`,
                  color,
                  borderColor: `${color}40`,
                }}
              >
                {member.domain}
              </Badge>
              <Badge className="text-[10px] bg-gray-800 text-gray-300 border-gray-700">
                {member.role}
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${attendance}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{attendance}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: projectStatus.color }}
                />
                <span
                  className="text-xs"
                  style={{ color: projectStatus.color }}
                >
                  {projectStatus.text}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Team Members
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your organization&apos;s workforce and assign permissions
            across domains.
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-lg shadow-amber-500/25"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="bg-gray-900/60 border-gray-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                  Total Members
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {members.length.toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <Badge className="mt-2 bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
              +12%
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 border-gray-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                  Active Projects
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.activeProjects}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <FolderOpen className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <Badge className="mt-2 bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px]">
              Normal
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 border-gray-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                  Avg Attendance
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.avgAttendance}%
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <Clock className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <Badge className="mt-2 bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
              High
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 border-gray-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                  Pending Requests
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.pendingRequests}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-500/15 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </div>
            <Badge className="mt-2 bg-red-500/15 text-red-400 border-red-500/30 text-[10px]">
              Attention
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-900/60 border-gray-800"
            />
          </div>
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-full md:w-[200px] bg-gray-900/60 border-gray-800">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <SelectValue placeholder="All Domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {DOMAINS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-[150px] bg-gray-900/60 border-gray-800">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Member">Member</SelectItem>
            </SelectContent>
          </Select>
          {(search || domainFilter !== "all" || roleFilter !== "all") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearch("");
                setDomainFilter("all");
                setRoleFilter("all");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </motion.div>

      {/* Members Table (Desktop / Tablet) */}
      <motion.div variants={itemVariants}>
        <Card className="hidden md:block bg-gray-900/60 border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Member Name
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Email Address
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Attendance
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Project Status
                  </th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {paginated.map(renderMemberRow)}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Table Footer & Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              Showing {startIndex}-{endIndex} of {filtered.length} results
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-gray-400"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              {getPageNumbers().map((page, i) =>
                page === "..." ? (
                  <span key={`dots-${i}`} className="px-2 text-xs text-gray-500">
                    …
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={page === safePage ? "default" : "ghost"}
                    size="sm"
                    className={`h-8 w-8 text-xs ${
                      page === safePage
                        ? "bg-amber-500 text-black hover:bg-amber-600"
                        : "text-gray-400"
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-gray-400"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          <AnimatePresence mode="popLayout">
            {paginated.map(renderMobileCard)}
          </AnimatePresence>

          {/* Mobile Pagination */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-500">
              {startIndex}-{endIndex} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-gray-400"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-gray-400 px-2">
                {safePage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-gray-400"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Users className="h-12 w-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400">No members found</p>
            <p className="text-sm text-gray-600">
              Try adjusting your filters
            </p>
          </div>
        )}
      </motion.div>

      {/* Footer */}
      <motion.div
        variants={itemVariants}
        className="text-center py-4 border-t border-gray-800"
      >
        <p className="text-[11px] text-gray-600 uppercase tracking-wider">
          © 2024 Organization Management System • Version 4.2.1
        </p>
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit Member" : "Add New Member"}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Update the member's information."
                : "Fill in the details to add a new team member."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="john@team.dev"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Domain</Label>
                <Select
                  value={form.domain}
                  onValueChange={(v) => setForm({ ...form, domain: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAINS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Member">Member</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {editingMember ? "Save Changes" : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <strong>{deletingMember?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
