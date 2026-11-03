"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CATEGORY_COLORS: Record<string, string> = {
  exam: "bg-red-100 text-red-700 border-red-200",
  assignment: "bg-blue-100 text-blue-700 border-blue-200",
  holiday: "bg-green-100 text-green-700 border-green-200",
  event: "bg-primary/10 text-primary border-primary/200",
  deadline: "bg-amber-100 text-amber-700 border-amber-200",
};

type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  isAllDay: boolean;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    category: "event",
    startsAt: "",
    endsAt: "",
    location: "",
    isAllDay: false,
  });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const res = await fetch("/api/v1/calendar", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (e) {
      console.error("Failed to load calendar events:", e);
    } finally {
      setLoading(false);
    }
  }

  const viewDateObj = new Date(viewDate);
  const currentMonth = viewDateObj.getMonth();
  const currentYear = viewDateObj.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const daysInMonth = Array.from({ length: totalDays }, (_, i) => i + 1);
  const daysBefore = Array.from({ length: startDay }, (_, i) => firstDay.getDate() - startDay + i + 1);
  const daysAfter = Array.from({ length: 7 - ((startDay + totalDays) % 7) || 7 }, (_, i) => i + 1);

  const eventsByDay = events.reduce((acc: Record<string, CalendarEvent[]>, event) => {
    const date = new Date(event.startsAt).toISOString().split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  function getDayEvents(date: number) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
    return eventsByDay[dateStr] || [];
  }

  function handleDateClick(date: number) {
    setSelectedDate(new Date(currentYear, currentMonth, date));
    setOpenDialog(true);
  }

  function prevMonth() {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  }

  function nextMonth() {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });
      if (res.ok) {
        setOpenDialog(false);
        setNewEvent({ title: "", description: "", category: "event", startsAt: "", endsAt: "", location: "", isAllDay: false });
        await loadEvents();
      }
    } catch (e) {
      console.error("Failed to create event:", e);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title="Academic Calendar"
        description="Track exams, assignments, holidays, and campus events"
        icon={<CalendarDays size={14} />}
      />

      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={prevMonth} disabled={currentMonth === 0 && currentYear === 2024}>
            <ChevronLeft size={14} />
          </Button>
          <h2 className="text-xl font-bold">{MONTHS[currentMonth]} {currentYear}</h2>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-7 gap-1 mb-4">
          {DAYS.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 h-[calc(100vh-350px)] min-h-[400px]">
          {daysBefore.map((day) => (
            <div key={`prev-${day}`} className="h-24 flex flex-col items-center justify-center text-[10px] text-muted-40">
              <span>{day}</span>
            </div>
          ))}
          {daysInMonth.map((day) => {
            const dayEvents = getDayEvents(day);
            const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
            const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;

            return (
              <div
                key={day}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "h-24 flex flex-col items-center justify-center text-[9px] rounded-lg cursor-pointer transition-all",
                  isSelected ? "ring-2 ring-primary ring-offset-1" : "",
                  isToday ? "bg-primary/10 ring-1 ring-primary" : "",
                  dayEvents.length > 0 ? "border border-primary/20" : "border border-transparent"
                )}
              >
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className="text-xs font-semibold">{day}</span>
                  {isToday && <span className="text-[8px] font-bold bg-primary px-1 rounded">●</span>}
                </div>
                {dayEvents.slice(0, 2).map((event) => (
                  <div key={event.id} className="h-5 flex items-center rounded-sm px-1 text-[8px] font-medium bg-primary/20 text-primary truncate" title={event.title}>
                    {event.title.length > 10 ? `${event.title.slice(0, 8)}…` : event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="h-5 flex items-center rounded-sm px-1 text-[8px] text-muted-2 bg-accent truncate">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            );
          )}
          {daysAfter.map((day) => (
            <div key={`after-${day}`} className="h-24 flex flex-col items-center justify-center text-[10px] text-muted-40">
              <span>{day}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 mx-auto max-w-4xl">
        <h3 className="text-lg font-bold mb-4">Upcoming Events</h2>
        <div className="flex flex-col gap-2">
          {events
            .filter((e) => new Date(e.startsAt) >= new Date(currentYear, currentMonth, 1))
            .slice(0, 10)
            .map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-accent hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Badge tone={CATEGORY_COLORS[event.category] ? "primary" : "neutral"} className="normal-case tracking-normal text-[9px]">
                    {event.category}
                  </Badge>
                  {event.isAllDay && <span className="text-[9px] font-medium text-primary">All day</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{event.title}</p>
                  {event.location && <p className="text-[9px] text-muted">{event.location}</p>}
                </div>
                <span className="text-[10px] text-muted">
                  {new Date(event.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          )}
          {events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted">
              <CalendarDays size={48} className="mb-3 opacity-50" />
              <p>No upcoming events</p>
            </div>
          )}
        </div>
      </section>

      <Modal open={openDialog} onClose={() => setOpenDialog(false)} title="New Event" description="Add a new event to your calendar">
        <form onSubmit={createEvent} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Title</label>
            <input
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="h-9 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Description</label>
            <Textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              rows={3}
              className="h-24 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Category</label>
            <select
              value={newEvent.category}
              onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
              className="h-9 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
            >
              <option value="event">Event</option>
              <option value="exam">Exam</option>
              <option value="assignment">Assignment</option>
              <option value="holiday">Holiday</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Starts At</label>
            <input
              type="datetime-local"
              value={newEvent.startsAt}
              onChange={(e) => setNewEvent({ ...newEvent, startsAt: e.target.value })}
              className="h-9 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Location</label>
            <input
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              className="h-9 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold text-muted">All day</label>
            <input
              type="checkbox"
              checked={newEvent.isAllDay}
              onChange={(e) => setNewEvent({ ...newEvent, isAllDay: e.target.checked })}
              className="size-4 rounded border border-border bg-card"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Event</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}