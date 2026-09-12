"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "cn";
import { Briefcase, CheckSquare, FileText, Pause, Play, Square, Timer, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/format";
import { timerStore, useTimerStore } from "@/stores/timer/timer-store";

export function GlobalActiveTimer() {
  const { isRunning, isPaused, elapsedSeconds, matterId, taskId, description } = useTimerStore((state) => ({
    isRunning: state.isRunning,
    isPaused: state.isPaused,
    elapsedSeconds: state.elapsedSeconds,
    matterId: state.matterId,
    taskId: state.taskId,
    description: state.description,
  }));
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  let timerColor = "text-muted-foreground";
  if (isRunning && !isPaused) {
    timerColor = "text-primary animate-pulse";
  } else if (isPaused) {
    timerColor = "text-amber-600";
  }

  let statusText = "Stopped";
  if (isRunning) {
    statusText = isPaused ? "Paused" : "Running";
  }

  const renderTimerActions = () => {
    if (!isRunning && elapsedSeconds === 0) {
      return (
        <Button className="flex-1" onClick={() => setIsExpanded(false)}>
          Go to Time Tracking
        </Button>
      );
    }

    if (isRunning) {
      return (
        <>
          <Button variant="outline" className="flex-1" onClick={() => timerStore.getState().pauseTimer()}>
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </Button>
          <Button variant="destructive" className="flex-1" onClick={() => timerStore.getState().stopTimer()}>
            <Square className="mr-2 h-4 w-4" />
            Stop
          </Button>
        </>
      );
    }

    if (isPaused) {
      return (
        <>
          <Button className="flex-1" onClick={() => timerStore.getState().resumeTimer()}>
            <Play className="mr-2 h-4 w-4" />
            Resume
          </Button>
          <Button variant="destructive" className="flex-1" onClick={() => timerStore.getState().stopTimer()}>
            <Square className="mr-2 h-4 w-4" />
            Stop
          </Button>
        </>
      );
    }

    return null;
  };

  const handleBackdropClick = () => {
    setIsExpanded(false);
  };

  const handleBackdropKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
      setIsExpanded(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-10 w-10 rounded-full transition-colors", isRunning && "text-primary")}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isRunning ? "Active timer" : "Start timer"}
      >
        <Timer className={cn("h-5 w-5", timerColor)} />
        {isRunning && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white">
            {isPaused ? "⏸" : "▶"}
          </span>
        )}
      </Button>

      {isExpanded && (
        <button
          type="button"
          className="fixed inset-0 z-40"
          onClick={handleBackdropClick}
          onKeyDown={handleBackdropKeyDown}
          aria-label="Close timer"
        >
          <div className="absolute right-4 top-14 z-50 w-80 bg-popover border rounded-lg shadow-lg p-4 animate-in fade-in-0 zoom-in-95">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Active Timer</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center py-4">
                <div className="font-mono text-4xl font-bold text-primary">{formatTime(elapsedSeconds)}</div>
                <div className="text-sm text-muted-foreground mt-1">{statusText}</div>
              </div>

              {(matterId || taskId || description) && (
                <div className="space-y-2 text-sm border-t pt-4">
                  {matterId && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>Matter: {matterId}</span>
                    </div>
                  )}
                  {taskId && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckSquare className="h-4 w-4" />
                      <span>Task: {taskId}</span>
                    </div>
                  )}
                  {description && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="truncate">{description}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 border-t pt-4">{renderTimerActions()}</div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsExpanded(false);
                  router.push("/dashboard/time-tracking");
                }}
              >
                Open Time Tracking
              </Button>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
