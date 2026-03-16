import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MEETINGS as INITIAL_MEETINGS, MEMBERS, DOMAINS, DOMAIN_COLORS } from "@/data/mockData";
import {
  CalendarClock,
  Plus,
  Clock,
  AlertTriangle,
  Calendar,
  MapPin,
  User,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState(INITIAL_MEETINGS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [conflict, setConflict] = useState(null);
  const [domainFilter, setDomainFilter] = useState("all");

  const [form, setForm] = useState({
    title: "",
    domain: "",
    date: "",
    time: "",
    description: "",
  });

  const filtered = useMemo(() => {
    if (domainFilter === "all") return meetings;
    return meetings.filter((m) => m.domain === domainFilter);
  }, [meetings, domainFilter]);

  const grouped = useMemo(() => {
    const groups = {};
    const sorted = [...filtered].sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
    );
    sorted.forEach((m) => {
      const key = m.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return groups;
  }, [filtered]);

  const checkConflict = (domain, date, time) => {
    return meetings.find(
      (m) => m.domain === domain && m.date === date && m.time === time
    );
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
    setDialogOpen(false);
    setForm({ title: "", domain: "", date: "", time: "", description: "" });
    setConflict(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-primary" />
            Meeting Scheduler
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule and manage team meetings with conflict detection
          </p>
        </div>
        <Button
          onClick={() => {
            setConflict(null);
            setForm({ title: "", domain: "", date: "", time: "", description: "" });
            setDialogOpen(true);
          }}
          className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 shadow-lg shadow-purple-500/25"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      </motion.div>

      {/* Filter */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <Select value={domainFilter} onValueChange={setDomainFilter}>
              <SelectTrigger className="w-full md:w-[250px]">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Domains" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {DOMAINS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </motion.div>

      {/* Timeline view */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([date, dayMeetings]) => {
          const dateObj = new Date(date + "T00:00:00");
          const isToday = date === today;
          const isPast = date < today;
          return (
            <motion.div key={date} variants={itemVariants}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isToday ? "bg-primary/20" : "bg-muted"}`}>
                  <Calendar className={`h-5 w-5 ${isToday ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${isToday ? "text-primary" : ""}`}>
                    {dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isToday ? "Today" : isPast ? "Past" : "Upcoming"} • {dayMeetings.length} meeting{dayMeetings.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {isToday && <Badge className="ml-auto bg-primary/20 text-primary border-primary/30 text-[10px]">Today</Badge>}
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 ml-5 pl-8 border-l-2 border-border/50">
                {dayMeetings.map((meeting) => {
                  const creator = MEMBERS.find((m) => m.id === meeting.createdBy);
                  const color = DOMAIN_COLORS[meeting.domain] || "#8b5cf6";
                  return (
                    <Card key={meeting.id} className={`hover:border-white/20 transition-all duration-300 overflow-hidden ${isPast ? "opacity-60" : ""}`}>
                      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}66)` }} />
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <Badge
                            className="text-[10px]"
                            style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40` }}
                          >
                            {meeting.domain}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {meeting.time}
                          </div>
                        </div>
                        <h3 className="font-semibold text-sm mb-2">{meeting.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {meeting.description}
                        </p>
                        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[8px]">
                              {creator?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] text-muted-foreground">
                            Scheduled by {creator?.name}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-16">
          <CalendarClock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No meetings found</p>
        </div>
      )}

      {/* Schedule Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
            <DialogDescription>
              Create a new meeting. The system will check for time conflicts.
            </DialogDescription>
          </DialogHeader>

          {conflict && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-destructive">Time Conflict Detected!</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  "{conflict.title}" is already scheduled for {conflict.domain} on {conflict.date} at {conflict.time}.
                  Please choose a different time or domain.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Meeting Title</Label>
              <Input
                placeholder="Sprint Planning"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Domain</Label>
              <Select value={form.domain} onValueChange={(v) => { setForm({ ...form, domain: v }); setConflict(null); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => { setForm({ ...form, date: e.target.value }); setConflict(null); }}
                  className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => { setForm({ ...form, time: e.target.value }); setConflict(null); }}
                  className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Meeting agenda and details..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSchedule} className="bg-gradient-to-r from-violet-600 to-purple-700">
              Schedule Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
