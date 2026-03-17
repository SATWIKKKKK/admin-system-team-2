import { useState, useMemo } from "react";
import { PROJECTS as INITIAL_PROJECTS, MEMBERS, DOMAINS, DOMAIN_COLORS } from "@/data/mockData";
import { Download, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_MAP = {
  Completed: "Submitted",
  "In Progress": "In Review",
  Pending: "Not Submitted",
};

const STATUS_STYLES = {
  Submitted: { dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  "In Review": { dot: "bg-amber-400", text: "text-amber-400", bg: "bg-amber-500/10" },
  "Not Submitted": { dot: "bg-red-400", text: "text-red-400", bg: "bg-red-500/10" },
};

const TABS = ["All Submissions", "Pending Review", "Completed"];
const ITEMS_PER_PAGE = 5;

function getInitials(name) {
  return name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??";
}

function getDisplayStatus(status) {
  return STATUS_MAP[status] || status;
}

function getActionLabel(status) {
  if (status === "Completed") return "Mark Pending";
  if (status === "In Progress") return "Mark Submitted";
  return "Mark Complete";
}

function getNextStatus(status) {
  if (status === "Completed") return "Pending";
  if (status === "In Progress") return "Completed";
  return "Completed";
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [activeTab, setActiveTab] = useState("All Submissions");
  const [currentPage, setCurrentPage] = useState(1);

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

  const filtered = useMemo(() => {
    if (activeTab === "All Submissions") return projects;
    if (activeTab === "Pending Review") return projects.filter((p) => p.status === "Pending" || p.status === "In Progress");
    if (activeTab === "Completed") return projects.filter((p) => p.status === "Completed");
    return projects;
  }, [projects, activeTab]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const startEntry = filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endEntry = Math.min(currentPage * ITEMS_PER_PAGE, filtered.length);

  // Reset page when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const exportCSV = () => {
    const header = "Member,Domain,Project Name,Status\n";
    const rows = filtered
      .map((p) => {
        const member = MEMBERS.find((m) => m.id === p.memberId);
        return `"${member?.name}","${p.domain}","${p.projectTitle}","${getDisplayStatus(p.status)}"`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project_submissions.csv";
    a.click();
    URL.revokeObjectURL(url);
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
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Submissions</h1>
          <p className="text-sm text-gray-400 mt-1">Review and verify submissions from all domain members.</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 border border-amber-500 text-amber-500 rounded-lg hover:bg-amber-500/10 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-4 sm:gap-6 border-b border-white/10 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap shrink-0 ${
              activeTab === tab ? "text-amber-500" : "text-gray-400 hover:text-gray-300"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
            )}
          </button>
        ))}
      </motion.div>

      {/* Desktop Table */}
      <motion.div variants={itemVariants} className="hidden md:block">
        <div className="rounded-xl border border-white/10 overflow-hidden" style={{ backgroundColor: "#141414" }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {["MEMBER", "DOMAIN", "PROJECT NAME", "STATUS", "ACTION"].map((h) => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-amber-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {paginated.map((project) => {
                  const member = MEMBERS.find((m) => m.id === project.memberId);
                  const initials = getInitials(member?.name);
                  const displayStatus = getDisplayStatus(project.status);
                  const style = STATUS_STYLES[displayStatus];

                  return (
                    <motion.tr
                      key={project.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-500 text-xs font-semibold shrink-0">
                            {initials}
                          </div>
                          <span className="text-sm text-white font-medium">{member?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{project.domain}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{project.projectTitle}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => updateStatus(project.id, getNextStatus(project.status))}
                          className="text-sm text-amber-500 hover:text-amber-400 font-medium transition-colors"
                        >
                          {getActionLabel(project.status)}
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>

          {paginated.length === 0 && (
            <div className="text-center py-16 text-gray-500">No projects found</div>
          )}
        </div>
      </motion.div>

      {/* Mobile Cards */}
      <motion.div variants={itemVariants} className="md:hidden space-y-3">
        <AnimatePresence mode="popLayout">
          {paginated.map((project) => {
            const member = MEMBERS.find((m) => m.id === project.memberId);
            const initials = getInitials(member?.name);
            const displayStatus = getDisplayStatus(project.status);
            const style = STATUS_STYLES[displayStatus];

            return (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-xl border border-white/10 p-4 space-y-3"
                style={{ backgroundColor: "#141414" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-500 text-xs font-semibold shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{member?.name}</p>
                      <p className="text-xs text-gray-400">{project.domain}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {displayStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <p className="text-sm text-gray-300">{project.projectTitle}</p>
                  <button
                    onClick={() => updateStatus(project.id, getNextStatus(project.status))}
                    className="text-sm text-amber-500 hover:text-amber-400 font-medium transition-colors whitespace-nowrap ml-3"
                  >
                    {getActionLabel(project.status)}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {paginated.length === 0 && (
          <div className="text-center py-16 text-gray-500">No projects found</div>
        )}
      </motion.div>

      {/* Pagination + New Project */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors text-sm font-semibold">
          <Plus className="h-4 w-4" />
          New Project
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm">
          <span className="text-gray-400">
            Showing {startEntry} to {endEntry} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((page, idx, arr) => (
                <span key={page} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-1 text-gray-500">…</span>}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-amber-500 text-black"
                        : "border border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {page}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
