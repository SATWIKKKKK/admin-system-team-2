import { useState, useMemo } from "react";
import { MEETINGS as INITIAL_MEETINGS, MEMBERS, DOMAINS, DOMAIN_COLORS } from "@/data/mockData";
import { AlertTriangle, ChevronLeft, ChevronRight, ChevronDown, Clock } from "lucide-react";
import { motion } from "framer-motion";

const MONTH_NAMES = [
  "JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE",
  "JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER",
];
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function MiniCalendar({ selectedDate, onSelectDate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const next = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) =>
    d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const isSelected = (d) => {
    if (!selectedDate) return false;
    const [y, m, dd] = selectedDate.split("-").map(Number);
    return d === dd && viewMonth === m - 1 && viewYear === y;
  };

  const handleClick = (d) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    onSelectDate(`${viewYear}-${mm}-${dd}`);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold tracking-wider text-white">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button onClick={next} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-gray-500 mb-2">
        {DAY_LABELS.map((l, i) => <span key={i}>{l}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {cells.map((d, i) =>
          d ? (
            <button
              key={i}
              onClick={() => handleClick(d)}
              className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center transition-colors text-xs
                ${isSelected(d) ? "bg-amber-500 text-black font-bold" : isToday(d) ? "bg-amber-500/20 text-amber-400 font-semibold" : "text-gray-300 hover:bg-white/10"}`}
            >
              {d}
            </button>
          ) : <span key={i} />
        )}
      </div>
    </div>
  );
}

function AvailabilityPanel({ meetings, selectedDate }) {
  const domainSlots = useMemo(() => {
    const maxSlots = 6;
    const dateMeetings = selectedDate
      ? meetings.filter((m) => m.date === selectedDate)
      : meetings;

    const counts = {};
    dateMeetings.forEach((m) => { counts[m.domain] = (counts[m.domain] || 0) + 1; });

    return DOMAINS.slice(0, 4).map((domain) => {
      const used = counts[domain] || 0;
      const remaining = Math.max(0, maxSlots - used);
      const isFull = remaining === 0 && used > 0;
      return { domain, used, remaining, total: maxSlots, isFull };
    });
  }, [meetings, selectedDate]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-xs font-bold tracking-wider text-amber-400 mb-4">AVAILABILITY</h3>
      <div className="space-y-3">
        {domainSlots.map(({ domain, used, remaining, total, isFull }) => (
          <div key={domain}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-300 truncate mr-2">{domain}</span>
              <span className={`text-[11px] font-semibold ${isFull ? "text-red-400" : "text-amber-400"}`}>
                {isFull ? "Full" : `${remaining} slots`}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isFull ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-amber-500"}`}
                style={{ width: `${(used / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState(INITIAL_MEETINGS);
  const [conflict, setConflict] = useState(null);

  const [form, setForm] = useState({
    title: "",
    domain: "",
    date: "",
    time: "",
    description: "",
  });

  const [domainOpen, setDomainOpen] = useState(false);

  const checkConflict = (domain, date, time) => {
    return meetings.find(
      (m) => m.domain === domain && m.date === date && m.time === time
    );
  };

  const updateField = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);

    if (next.domain && next.date && next.time) {
      const existing = checkConflict(next.domain, next.date, next.time);
      setConflict(existing || null);
    } else {
      setConflict(null);
    }
  };

  const handleSchedule = () => {
    if (!form.title || !form.domain || !form.date || !form.time) return;

    const existing = checkConflict(form.domain, form.date, form.time);
    if (existing) {
      setConflict(existing);
      return;
    }

    const newMeeting = {
      id: "mt" + Date.now(),
      ...form,
      createdBy: "m1",
    };
    setMeetings((prev) => [...prev, newMeeting]);
    setForm({ title: "", domain: "", date: "", time: "", description: "" });
    setConflict(null);
  };

  const handleSaveDraft = () => {
    // Save as draft — just reset conflict for now
    setConflict(null);
  };

  const formatTime12 = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition";

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Schedule New Meeting</h1>
        <p className="text-sm text-gray-400 mt-1">
          Organize and sync with your specialized domain experts.
        </p>
      </motion.div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left — Form */}
        <motion.div variants={itemVariants} className="flex-1 lg:w-[60%] space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider text-amber-400 mb-1.5">
              MEETING TITLE
            </label>
            <input
              type="text"
              placeholder="e.g. Q4 Infrastructure Architecture Sync"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Domain + Date row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-[11px] font-bold tracking-wider text-amber-400 mb-1.5">
                DOMAIN
              </label>
              <button
                type="button"
                onClick={() => setDomainOpen(!domainOpen)}
                className={`${inputClass} flex items-center justify-between text-left`}
              >
                <span className={form.domain ? "text-white" : "text-gray-500"}>
                  {form.domain || "Select domain"}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
              </button>
              {domainOpen && (
                <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto rounded-lg border border-white/10 bg-[#1a1a2e] shadow-xl">
                  {DOMAINS.map((d) => (
                    <button
                      key={d}
                      onClick={() => { updateField("domain", d); setDomainOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-amber-500/10 hover:text-amber-400 transition"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-amber-400 mb-1.5">
                DATE
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </div>
          </div>

          {/* Time + Duration row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-amber-400 mb-1.5">
                TIME SLOT
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => updateField("time", e.target.value)}
                  className={`${inputClass} [color-scheme:dark]`}
                />
                {form.time && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    {formatTime12(form.time)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-400">Duration: <span className="text-white font-medium">60 minutes</span></span>
            </div>
          </div>

          {/* Conflict warning */}
          {conflict && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-amber-500/40 bg-amber-500/[0.08] p-4"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-300">Scheduling Conflict Identified</p>
                  <p className="text-xs text-gray-400 mt-1">
                    A meeting is already scheduled for &apos;{conflict.title}&apos; at this time.
                  </p>
                  <button
                    onClick={() => setConflict(null)}
                    className="mt-2 text-[11px] font-bold tracking-wider text-amber-400 hover:text-amber-300 transition"
                  >
                    VIEW CALENDAR
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider text-amber-400 mb-1.5">
              DESCRIPTION
            </label>
            <textarea
              placeholder="Outline the primary objectives and required artifacts..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleSaveDraft}
              className="px-6 py-2.5 rounded-lg border border-amber-500 text-amber-400 text-sm font-bold tracking-wider hover:bg-amber-500/10 transition"
            >
              SAVE AS DRAFT
            </button>
            <button
              onClick={handleSchedule}
              className="px-6 py-2.5 rounded-lg bg-amber-500 text-black text-sm font-bold tracking-wider hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
            >
              CONFIRM SCHEDULE
            </button>
          </div>
        </motion.div>

        {/* Right — Calendar & Availability */}
        <motion.div variants={itemVariants} className="lg:w-[40%] space-y-5">
          <MiniCalendar
            selectedDate={form.date}
            onSelectDate={(d) => updateField("date", d)}
          />
          <AvailabilityPanel meetings={meetings} selectedDate={form.date} />
        </motion.div>
      </div>
    </motion.div>
  );
}
