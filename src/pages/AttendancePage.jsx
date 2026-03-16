import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MEMBERS, MEETINGS, ATTENDANCE as INITIAL_ATTENDANCE, DOMAIN_COLORS } from "@/data/mockData";
import {
  ClipboardCheck,
  Check,
  X,
  UserCheck,
  UserX,
  Filter,
  CalendarDays,
} from "lucide-react";
import { motion } from "framer-motion";

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

  const markAllPresent = () => {
    domainMembers.forEach((m) => markAttendance(m.id, "Present"));
  };

  const stats = useMemo(() => {
    const marked = domainMembers.filter((m) => getStatus(m.id));
    const present = domainMembers.filter((m) => getStatus(m.id) === "Present");
    return {
      total: domainMembers.length,
      marked: marked.length,
      present: present.length,
      absent: marked.length - present.length,
    };
  }, [domainMembers, attendanceForMeeting]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          Attendance Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Mark attendance for meeting sessions
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1.5 block">Meeting</label>
                <Select value={selectedMeeting} onValueChange={setSelectedMeeting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meeting" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEETINGS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.title} — {m.domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-[200px]">
                <label className="text-xs text-muted-foreground mb-1.5 block">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={markAllPresent} variant="outline" className="whitespace-nowrap">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Mark All Present
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: stats.total, icon: Filter, color: "text-blue-400" },
          { label: "Marked", value: stats.marked, icon: CalendarDays, color: "text-purple-400" },
          { label: "Present", value: stats.present, icon: UserCheck, color: "text-emerald-400" },
          { label: "Absent", value: stats.absent, icon: UserX, color: "text-red-400" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Meeting info */}
      {meeting && (
        <motion.div variants={itemVariants}>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold">{meeting.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {meeting.domain} • {meeting.date} at {meeting.time}
                </p>
              </div>
              <Badge
                style={{
                  backgroundColor: `${DOMAIN_COLORS[meeting.domain]}20`,
                  color: DOMAIN_COLORS[meeting.domain],
                  borderColor: `${DOMAIN_COLORS[meeting.domain]}40`,
                }}
              >
                {meeting.domain}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Members list */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Members — {meeting?.domain}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {domainMembers.map((member) => {
                const status = getStatus(member.id);
                const color = DOMAIN_COLORS[member.domain] || "#8b5cf6";
                const initials = member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2);
                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                      status === "Present"
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : status === "Absent"
                        ? "border-red-500/30 bg-red-500/5"
                        : "border-border hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback
                          className="text-xs font-bold"
                          style={{ backgroundColor: `${color}25`, color }}
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role} • {member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {status && (
                        <Badge variant={status === "Present" ? "success" : "destructive"} className="text-[10px] mr-2">
                          {status}
                        </Badge>
                      )}
                      <Button
                        size="icon"
                        variant={status === "Present" ? "default" : "outline"}
                        className={`h-8 w-8 ${status === "Present" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                        onClick={() => markAttendance(member.id, "Present")}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant={status === "Absent" ? "destructive" : "outline"}
                        className="h-8 w-8"
                        onClick={() => markAttendance(member.id, "Absent")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            {domainMembers.length === 0 && (
              <div className="text-center py-12">
                <ClipboardCheck className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No members in this domain</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
