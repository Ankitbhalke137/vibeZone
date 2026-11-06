"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CATEGORY_TONES: Record<string, BadgeTone> = {
  exam: "red",
  assignment: "cyan",
  holiday: "green",
  event: "violet",
  deadline: "amber",
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
  const [formError, setFormError] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    category: "event",
    startsAt: "",
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
  const daysAfter = Array.from({ length: (7 - ((startDay + totalDays) % 7)) % 7 }, (_, i) => i + 1);

  const eventsByDay = events.reduce((acc: Record<string, CalendarEvent[]>, event) => {
    const date = new Date(event.startsAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

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
    setFormError(null);
    if (!newEvent.title.trim() || !newEvent.startsAt) {
      setFormError("A title and start time are required.");
      return;
    }
    try {
      const res = await fetch("/api/v1/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEvent.title.trim(),
          description: newEvent.description.trim() || undefined,
          category: newEvent.category,
          startsAt: new Date(newEvent.startsAt).toISOString(),
          location: newEvent.location.trim() || undefined,
          isAllDay: newEvent.isAllDay,
        }),
      });
      if (res.ok) {
        setOpenDialog(false);
        setNewEvent({ title: "", description: "", category: "event", startsAt: "", location: "", isAllDay: false });
        await loadEvents();
      } else {
        const data = await res.json().catch(() => null);
        setFormError(data?.error ?? "Could not create the event. Please sign in and try again.");
      }
    } catch (err) {
      console.error("Failed to create event:", err);
      setFormError("Network error. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Campus"
        title="Academic Calendar"
        description="Track exams, assignments, holidays, and campus events in one shared calendar."
        actions={
          <Button onClick={() => setOpenDialog(true)}>
            <Plus size={14} /> New event
          </Button>
        }
      />

      <div className="vz-panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Button variant="ghost" size="sm" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft size={16} />
          </Button>
          <h2 className="text-base font-bold tracking-tight">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <Button variant="ghost" size="sm" onClick={nextMonth} aria-label="Next month">
            <ChevronRight size={16} />
          </Button>
        </div>

        <div className="grid grid-cols-7 border-b border-border bg-accent/40">
          {DAYS.map((day) => (
            <div key={day} className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {daysBefore.map((day) => (
            <div key={`prev-${day}`} className="min-h-20 border-b border-r border-border/60 p-1.5 text-[10px] text-muted-2">
              {day}
            </div>
          ))}
          {daysInMonth.map((day) => {
            const dayEvents = getDayEvents(day);
            const now = new Date();
            const isToday = day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();
            const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;

            return (
              <button
                type="button"
                key={day}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "flex min-h-20 flex-col gap-0.5 border-b border-r border-border/60 p-1.5 text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50",
                  isSelected && "bg-primary/5 ring-2 ring-inset ring-primary/40",
                  isToday && "bg-primary/10",
                )}
              >
                <span className={cn("text-[11px] font-semibold", isToday ? "text-primary" : "text-foreground")}>
                  {day}
                </span>
                {dayEvents.slice(0, 2).map((event) => (
                  <span key={event.id} className="truncate rounded bg-primary/10 px-1 py-0.5 text-[9px] font-medium text-primary" title={event.title}>
                    {event.title}
                  </span>
                ))}
                {dayEvents.length > 2 && (
                  <span className="px-1 text-[9px] text-muted">+{dayEvents.length - 2} more</span>
                )}
              </button>
            );
          })}
          {daysAfter.map((day) => (
            <div key={`after-${day}`} className="min-h-20 border-b border-r border-border/60 p-1.5 text-[10px] text-muted-2">
              {day}
            </div>
          ))}
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-bold tracking-tight">Upcoming events</h3>
        <div className="flex flex-col gap-2">
          {events
            .filter((e) => new Date(e.startsAt) >= new Date(currentYear, currentMonth, 1))
            .slice(0, 10)
            .map((event) => (
              <div key={event.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/30">
                <Badge tone={CATEGORY_TONES[event.category] ?? "neutral"} className="mt-0.5 normal-case tracking-normal">
                  {event.category}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{event.title}</p>
                  <p className="text-[11px] text-muted">
                    {event.location ? `${event.location} · ` : ""}
                    {new Date(event.startsAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {event.isAllDay ? " · All day" : ""}
                  </p>
                </div>
              </div>
            ))}
          {!loading && events.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-10 text-center text-muted">
              <CalendarDays size={32} className="opacity-50" />
              <p className="text-sm">No events yet. Add the first one.</p>
              <Button size="sm" variant="soft" onClick={() => setOpenDialog(true)}>
                <Plus size={14} /> New event
              </Button>
            </div>
          )}
        </div>
      </section>

      <Modal open={openDialog} onClose={() => setOpenDialog(false)} title="New calendar event" description={`Add an event on ${selectedDate.toLocaleDateString()}`}>
        <form onSubmit={createEvent} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Title</label>
            <Input
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="e.g. Mid-semester exams begin"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Description</label>
            <Textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              rows={3}
              placeholder="Optional details"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted">Category</label>
              <select
                value={newEvent.category}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                className="h-11 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary/60"
              >
                <option value="event">Event</option>
                <option value="exam">Exam</option>
                <option value="assignment">Assignment</option>
                <option value="holiday">Holiday</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted">Starts at</label>
              <Input
                type="datetime-local"
                value={newEvent.startsAt}
                onChange={(e) => setNewEvent({ ...newEvent, startsAt: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-muted">Location</label>
            <Input
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              placeholder="e.g. Auditorium, Block B"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={newEvent.isAllDay}
              onChange={(e) => setNewEvent({ ...newEvent, isAllDay: e.target.checked })}
              className="size-4 rounded border border-border bg-card accent-primary"
            />
            All-day event
          </label>
          {formError ? <p className="rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">{formError}</p> : null}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button type="submit">Create event</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
