import { useState, useMemo } from "react";
import { MEMBERS, MEETINGS, ATTENDANCE as INITIAL_ATTENDANCE, DOMAIN_COLORS } from "@/data/mockData";
import { ClipboardCheck, ChevronDown, CalendarDays, CheckCircle2, Plus } from "lucide-react";
import { motion } from "framer-motion";

const formatTime12 = (time24) => {
  const [h, m] = time24.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
};

const ROLE_STYLES = {
  Lead: { label: "Lead Organizer", bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
  Member: { label: "Member", bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
};

export default function AttendancePage() {
  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
  const [selectedMeeting, setSelectedMeeting] = useState(MEETINGS[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const meeting = useMemo(() => MEETINGS.find((m) => m.id === selectedMeeting), [selectedMeeting]);
  const domainMembers = useMemo(() => {
    if (!meeting) return [];
    return MEMBERS.filter((m) => m.domain === meeting.domain);
  }, [meeting]);

  const attendanceForMeeting = useMemo(() => {
    return attendance.filter(
      (a) => a.meetingId === selectedMeeting && a.date === selectedDate
    );
  }, [attendance, selectedMeeting, selectedDate]);

  const getStatus = (memberId) => {
    const record = attendanceForMeeting.find((a) => a.memberId === memberId);
    return record?.status || null;
  };

  const markAttendance = (memberId, status) => {
    const existing = attendance.find(
      (a) => a.memberId === memberId && a.meetingId === selectedMeeting && a.date === selectedDate
    );
    if (existing) {
      setAttendance((prev) =>
        prev.map((a) => (a.id === existing.id ? { ...a, status } : a))
      );
    } else {
      setAttendance((prev) => [
        ...prev,
        {
          id: "a" + Date.now() + memberId,
          memberId,
          meetingId: selectedMeeting,
          date: selectedDate,
          status,
        },
      ]);
    }
  };

  const stats = useMemo(() => {
    const marked = domainMembers.filter((m) => getStatus(m.id));
    return { total: domainMembers.length, marked: marked.length };
  }, [domainMembers, attendanceForMeeting]);

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const formatted = date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    return isToday ? `${formatted} (Today)` : formatted;
  };

  const getInitials = (name) => name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  const renderStatusDot = (status) => (
    <span className={`inline-block h-2.5 w-2.5 rounded-full ${status === "Present" ? "bg-emerald-400" : status === "Absent" ? "bg-red-400" : "bg-gray-500"}`} />
  );

  const renderStatusText = (status) => (
    <span className={`text-sm ${status === "Present" ? "text-emerald-400" : status === "Absent" ? "text-red-400" : "text-gray-400"}`}>
      {status || "Pending"}
    </span>
  );

  const renderActions = (memberId, status) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => markAttendance(memberId, "Present")}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${status === "Present" ? "bg-emerald-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
      >
        Present
      </button>
      <button
        onClick={() => markAttendance(memberId, "Absent")}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${status === "Absent" ? "bg-amber-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
      >
        Absent
      </button>
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <p className="text-sm text-amber-500 font-medium tracking-wide mb-1">Attendance Tracking</p>
        <h1 className="text-3xl font-bold text-white">Meeting Attendance</h1>
        <p className="text-gray-400 mt-1">Mark presence for today&apos;s scheduled sessions and generate reports.</p>
      </motion.div>

      {/* Controls */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
        <div className="flex-1">
          <label className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1.5 block">Select Meeting</label>
          <div className="relative">
            <select
              value={selectedMeeting}
              onChange={(e) => setSelectedMeeting(e.target.value)}
              className="w-full h-11 rounded-lg border border-gray-700 bg-gray-800/80 px-4 pr-10 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            >
              {MEETINGS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} - {formatTime12(m.time)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex-1">
          <label className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1.5 block">Session Date</label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-11 rounded-lg border border-gray-700 bg-gray-800/80 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>
        </div>

        <div className="bg-gray-800/80 border border-gray-700 rounded-lg px-6 py-3 lg:min-w-[200px]">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Live Stats</p>
          <p className="text-2xl font-bold text-white">
            {stats.marked} <span className="text-gray-400">/ {stats.total}</span>{" "}
            <span className="text-sm font-normal text-gray-400">Marked</span>
          </p>
        </div>
      </motion.div>

      {/* Desktop Table */}
      <motion.div variants={itemVariants} className="hidden md:block">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b border-gray-800">
            {["Member", "Role", "Status", "Actions"].map((h) => (
              <span key={h} className="text-xs font-semibold text-amber-500 uppercase tracking-wider">{h}</span>
            ))}
          </div>

          {domainMembers.map((member) => {
            const status = getStatus(member.id);
            const color = DOMAIN_COLORS[member.domain] || "#8b5cf6";
            const role = ROLE_STYLES[member.role] || ROLE_STYLES.Member;

            return (
              <motion.div
                key={member.id}
                variants={itemVariants}
                className={`grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-4 border-b border-gray-800 last:border-b-0 transition-colors duration-200 ${
                  status === "Present" ? "bg-emerald-500/5" : status === "Absent" ? "bg-red-500/5" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ backgroundColor: `${color}25`, color }}
                  >
                    {getInitials(member.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{member.name}</p>
                    <p className="text-xs text-gray-400 truncate">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${role.bg} ${role.text} ${role.border}`}>
                    {role.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {renderStatusDot(status)}
                  {renderStatusText(status)}
                </div>

                <div className="flex items-center">{renderActions(member.id, status)}</div>
              </motion.div>
            );
          })}

          {domainMembers.length === 0 && (
            <div className="text-center py-12">
              <ClipboardCheck className="h-10 w-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No members in this domain</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile Cards */}
      <motion.div variants={itemVariants} className="md:hidden space-y-3">
        {domainMembers.map((member) => {
          const status = getStatus(member.id);
          const color = DOMAIN_COLORS[member.domain] || "#8b5cf6";
          const role = ROLE_STYLES[member.role] || ROLE_STYLES.Member;

          return (
            <div
              key={member.id}
              className={`rounded-xl border p-4 transition-colors duration-200 ${
                status === "Present"
                  ? "bg-emerald-500/5 border-emerald-500/30"
                  : status === "Absent"
                  ? "bg-red-500/5 border-red-500/30"
                  : "bg-gray-900/50 border-gray-800"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ backgroundColor: `${color}25`, color }}
                >
                  {getInitials(member.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{member.name}</p>
                  <p className="text-xs text-gray-400 truncate">{member.email}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${role.bg} ${role.text} ${role.border}`}>
                  {role.label}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {renderStatusDot(status)}
                  {renderStatusText(status)}
                </div>
                {renderActions(member.id, status)}
              </div>
            </div>
          );
        })}

        {domainMembers.length === 0 && (
          <div className="text-center py-12">
            <ClipboardCheck className="h-10 w-10 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No members in this domain</p>
          </div>
        )}
      </motion.div>

      {/* Submit Section */}
      <motion.div variants={itemVariants}>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-white">Submit Final Report</h3>
              <p className="text-sm text-gray-400">Finalize and archive attendance records for this session.</p>
            </div>
          </div>
          <button className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors whitespace-nowrap">
            Submit Attendance Report
          </button>
        </div>
      </motion.div>

      {/* New Meeting */}
      <motion.div variants={itemVariants}>
        <button className="flex items-center gap-2 text-amber-500 hover:text-amber-400 font-medium transition-colors">
          <Plus className="h-5 w-5" />
          New Meeting
        </button>
      </motion.div>
    </motion.div>
  );
}
