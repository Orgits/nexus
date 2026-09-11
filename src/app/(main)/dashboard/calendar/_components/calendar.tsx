"use client";

import * as React from "react";

import { useCalendarController } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import listPlugin from "@fullcalendar/react/list";
import multiMonthPlugin from "@fullcalendar/react/multimonth";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import { cn } from "cn";
import { differenceInCalendarDays, endOfMonth, format, startOfMonth } from "date-fns";
import {
  AlertTriangle,
  Building2,
  Calendar as CalendarIcon,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  MapPin,
  Plus,
  User,
  XIcon,
} from "lucide-react";

import { EventCalendarViews } from "@/components/calendar/event-calendar-views";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockCalendarEvents } from "@/mock-data/calendar";
import { mockClients } from "@/mock-data/clients";
import { mockUsers } from "@/mock-data/users";
import type { CalendarEvent, CalendarEventType } from "@/types";

const views = [
  { key: "dayGridMonth", label: "Month" },
  { key: "timeGridWeek", label: "Week" },
  { key: "timeGridDay", label: "Day" },
  { key: "listMonth", label: "Agenda" },
];

const eventTypes: { value: CalendarEventType; label: string; color: string }[] = [
  { value: "compliance_deadline", label: "Compliance Deadline", color: "#ef4444" },
  { value: "task_deadline", label: "Task Deadline", color: "#f97316" },
  { value: "notice_deadline", label: "Notice Deadline", color: "#dc2626" },
  { value: "client_meeting", label: "Client Meeting", color: "#3b82f6" },
  { value: "internal_meeting", label: "Internal Meeting", color: "#8b5cf6" },
  { value: "hearing", label: "Hearing", color: "#06b6d4" },
  { value: "follow_up", label: "Follow-up", color: "#f97316" },
  { value: "review_meeting", label: "Review Meeting", color: "#06b6d4" },
  { value: "training", label: "Training", color: "#84cc16" },
  { value: "leave", label: "Leave", color: "#64748b" },
  { value: "holiday", label: "Holiday", color: "#a855f7" },
  { value: "other", label: "Other", color: "#64748b" },
];

const plugins = [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, multiMonthPlugin];

function transformEvent(event: CalendarEvent) {
  return {
    id: event.id,
    title: event.title,
    start: event.startAt,
    end: event.endAt,
    allDay: event.allDay,
    backgroundColor: event.color || eventTypes.find((t) => t.value === event.eventType)?.color || "#3b82f6",
    borderColor: event.color || eventTypes.find((t) => t.value === event.eventType)?.color || "#3b82f6",
    extendedProps: {
      eventType: event.eventType,
      description: event.description,
      clientId: event.clientId,
      matterId: event.matterId,
      taskId: event.taskId,
      noticeId: event.noticeId,
      complianceCycleId: event.complianceCycleId,
      assignedUserIds: event.assignedUserIds,
      location: event.location,
      meetingUrl: event.meetingUrl,
    },
  };
}

export function Calendar() {
  const controller = useCalendarController();
  const [eventCount, setEventCount] = React.useState(0);
  const [dateInfo, setDateInfo] = React.useState(() => {
    const now = new Date();
    return {
      title: format(now, "MMMM yyyy"),
      days: differenceInCalendarDays(endOfMonth(now), startOfMonth(now)) + 1,
    };
  });
  const [selectedEventTypes, setSelectedEventTypes] = React.useState<CalendarEventType[]>([]);
  const [selectedClientId, setSelectedClientId] = React.useState<string>("");
  const [selectedUserId, setSelectedUserId] = React.useState<string>("");
  const [_showFilters, _setShowFilters] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);

  const title = dateInfo.title;
  const days = dateInfo.days;

  let filteredEvents = mockCalendarEvents;

  if (selectedEventTypes.length > 0) {
    filteredEvents = filteredEvents.filter((e) => selectedEventTypes.includes(e.eventType));
  }
  if (selectedClientId) {
    filteredEvents = filteredEvents.filter((e) => e.clientId === selectedClientId);
  }
  if (selectedUserId) {
    filteredEvents = filteredEvents.filter((e) => e.assignedUserIds.includes(selectedUserId as any));
  }

  const transformedEvents = filteredEvents.map(transformEvent);

  const handleEventClick = (info: any) => {
    const eventId = info.event.id;
    const event = mockCalendarEvents.find((e) => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
    }
  };

  const activeFiltersCount = [selectedEventTypes.length > 0, selectedClientId, selectedUserId].filter(Boolean).length;

  return (
    <div className="flex flex-col overflow-hidden rounded-md border">
      <div className="flex flex-col gap-4 border-b bg-sidebar p-4 text-sidebar-foreground lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 shrink-0 flex-col gap-1">
          <div className="font-medium text-lg leading-none">{title}</div>
          <p className="text-muted-foreground text-sm">
            {days} days - {eventCount} events
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn("gap-1", activeFiltersCount > 0 && "border-primary/20 bg-primary/5 text-primary")}
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-primary text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" sideOffset={5} align="end">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Event Types</h4>
                  <div className="max-h-40 space-y-1 overflow-y-auto">
                    {eventTypes.map((type) => {
                      const checkboxId = `event-type-${type.value}`;
                      return (
                        <label
                          key={type.value}
                          htmlFor={checkboxId}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-accent"
                        >
                          <Checkbox
                            id={checkboxId}
                            checked={selectedEventTypes.includes(type.value)}
                            onCheckedChange={(checked) => {
                              setSelectedEventTypes((prev) =>
                                checked ? [...prev, type.value] : prev.filter((v) => v !== type.value),
                              );
                            }}
                          />
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: type.color }} />
                          <span className="text-sm">{type.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="mb-2 font-medium">Client</h4>
                  <Select value={selectedClientId} onValueChange={(v) => setSelectedClientId(v || "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="All clients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All clients</SelectItem>
                      {mockClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.displayName || client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="border-t pt-4">
                  <h4 className="mb-2 font-medium">Assigned User</h4>
                  <Select value={selectedUserId} onValueChange={(v) => setSelectedUserId(v || "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="All users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All users</SelectItem>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedEventTypes([]);
                      setSelectedClientId("");
                      setSelectedUserId("");
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <ButtonGroup>
            <Button size="icon" variant="outline" onClick={() => controller.prev()}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" onClick={() => controller.today()}>
              Today
            </Button>
            <Button size="icon" variant="outline" onClick={() => controller.next()}>
              <ChevronRight />
            </Button>
          </ButtonGroup>
          <Select
            value={controller.view?.type ?? views[0].key}
            onValueChange={(value) => {
              controller.changeView(value);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                {views.map((v) => (
                  <SelectItem key={v.key} value={v.key}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button>
            <Plus />
            Add event
          </Button>
        </div>
      </div>

      <EventCalendarViews
        controller={controller}
        initialView={views[0].key}
        plugins={[...plugins]}
        popoverCloseContent={() => <XIcon className="size-5 text-muted-foreground group-hover:text-foreground" />}
        events={transformedEvents}
        nowIndicator
        eventClick={handleEventClick}
        datesSet={(info) => {
          setDateInfo({
            title: info.view.title,
            days: differenceInCalendarDays(info.view.currentEnd, info.view.currentStart),
          });
          setEventCount(
            transformedEvents.filter((event) => {
              const start = new Date(event.start);
              return start >= info.start && start < info.end;
            }).length,
          );
        }}
      />

      {selectedEvent && <EventDetailPopover event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}

function EventDetailPopover({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  const client = event.clientId ? mockClients.find((c) => c.id === event.clientId) : null;
  const assignedUsers = event.assignedUserIds.map((id) => mockUsers.find((u) => u.id === id)).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-lg bg-card shadow-xl">
        <div className="flex items-start justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: event.color || eventTypes.find((t) => t.value === event.eventType)?.color }}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{event.title}</h3>
              <span className="text-muted-foreground text-sm capitalize">{event.eventType.replace(/_/g, " ")}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4 p-4">
          {event.description && (
            <div>
              <h4 className="mb-1 font-medium text-muted-foreground text-sm">Description</h4>
              <p className="text-sm">{event.description}</p>
            </div>
          )}

          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>
                {event.allDay
                  ? "All day"
                  : `${format(new Date(event.startAt), "MMM d, yyyy h:mm a")} - ${format(new Date(event.endAt), "h:mm a")}`}
              </span>
            </div>

            {client && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>Client: {client.displayName || client.name}</span>
              </div>
            )}

            {event.matterId && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>Matter: {event.matterId}</span>
              </div>
            )}

            {event.complianceCycleId && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span>Compliance Cycle: {event.complianceCycleId}</span>
              </div>
            )}

            {event.taskId && (
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                <span>Task: {event.taskId}</span>
              </div>
            )}

            {event.noticeId && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span>Notice: {event.noticeId}</span>
              </div>
            )}

            {assignedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Assigned: {assignedUsers.map((u) => u?.fullName).join(", ")}</span>
              </div>
            )}

            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
            )}

            {event.meetingUrl && (
              <a
                href={event.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary text-sm hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Join Meeting
              </a>
            )}
          </div>

          <div className="flex gap-2 border-t pt-2">
            <Button variant="outline" className="flex-1" onClick={() => alert("Edit event")}>
              Edit
            </Button>
            <Button className="flex-1" onClick={() => alert("View linked records")}>
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
