"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  matterId: string;
  taskId: string;
  description: string;
  isBillable: boolean;
  billingRate: number;
  startTimeRef: number | null;
  pausedTimeRef: number;

  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: (onComplete?: (entry: TimerEntry) => void) => void;
  setMatterId: (matterId: string) => void;
  setTaskId: (taskId: string) => void;
  setDescription: (description: string) => void;
  setIsBillable: (isBillable: boolean) => void;
  setBillingRate: (rate: number) => void;
  resetTimer: () => void;
  tick: () => void;
}

export interface TimerEntry {
  id: string;
  matterId: string;
  taskId?: string;
  description: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isBillable: boolean;
  billingRate: number;
  billedAmount: number;
}

const initialTimerState = {
  isRunning: false,
  isPaused: false,
  elapsedSeconds: 0,
  matterId: "",
  taskId: "",
  description: "",
  isBillable: true,
  billingRate: 2500,
  startTimeRef: null,
  pausedTimeRef: 0,
};

const useTimerStoreBase = create<TimerState>()(
  persist(
    (set, get) => ({
      ...initialTimerState,

      startTimer: () => {
        const { isPaused, startTimeRef, pausedTimeRef } = get();
        const now = Date.now();
        const newStartTimeRef = isPaused ? now - pausedTimeRef : now;
        const newPausedTimeRef = isPaused ? pausedTimeRef : 0;

        set({
          isRunning: true,
          isPaused: false,
          startTimeRef: newStartTimeRef,
          pausedTimeRef: newPausedTimeRef,
        });

        const interval = setInterval(() => {
          const state = get();
          if (state.isRunning && !state.isPaused && state.startTimeRef) {
            const elapsed = Math.floor((Date.now() - state.startTimeRef) / 1000) + state.pausedTimeRef;
            set({ elapsedSeconds: elapsed });
          }
        }, 1000);

        if (typeof window !== "undefined") {
          (window as any).__timerInterval = interval;
        }
      },

      pauseTimer: () => {
        const { startTimeRef, pausedTimeRef } = get();
        if (startTimeRef) {
          const newPausedTimeRef = Math.floor((Date.now() - startTimeRef) / 1000) + pausedTimeRef;
          set({ isRunning: false, isPaused: true, pausedTimeRef: newPausedTimeRef, startTimeRef: null });
        }
        if (typeof window !== "undefined" && (window as any).__timerInterval) {
          clearInterval((window as any).__timerInterval);
          (window as any).__timerInterval = null;
        }
      },

      resumeTimer: () => {
        const { pausedTimeRef } = get();
        const now = Date.now();
        set({
          isRunning: true,
          isPaused: false,
          startTimeRef: now - pausedTimeRef,
          pausedTimeRef: 0,
        });

        const interval = setInterval(() => {
          const state = get();
          if (state.isRunning && !state.isPaused && state.startTimeRef) {
            const elapsed = Math.floor((Date.now() - state.startTimeRef) / 1000) + state.pausedTimeRef;
            set({ elapsedSeconds: elapsed });
          }
        }, 1000);

        if (typeof window !== "undefined") {
          (window as any).__timerInterval = interval;
        }
      },

      stopTimer: (onComplete) => {
        const { elapsedSeconds, matterId, taskId, description, isBillable, billingRate } = get();

        if (typeof window !== "undefined" && (window as any).__timerInterval) {
          clearInterval((window as any).__timerInterval);
          (window as any).__timerInterval = null;
        }

        const finalSeconds = elapsedSeconds;

        if (onComplete && finalSeconds > 0 && matterId) {
          const entry: TimerEntry = {
            id: `time-${Date.now()}`,
            matterId,
            taskId: taskId || undefined,
            description,
            startTime: new Date(Date.now() - finalSeconds * 1000).toISOString(),
            endTime: new Date().toISOString(),
            durationMinutes: Math.round(finalSeconds / 60),
            isBillable,
            billingRate,
            billedAmount: isBillable ? Math.round((finalSeconds / 3600) * billingRate) : 0,
          };
          onComplete(entry);
        }

        set({
          ...initialTimerState,
        });
      },

      setMatterId: (matterId) => set({ matterId }),
      setTaskId: (taskId) => set({ taskId }),
      setDescription: (description) => set({ description }),
      setIsBillable: (isBillable) => set({ isBillable }),
      setBillingRate: (billingRate) => set({ billingRate }),

      resetTimer: () => {
        if (typeof window !== "undefined" && (window as any).__timerInterval) {
          clearInterval((window as any).__timerInterval);
          (window as any).__timerInterval = null;
        }
        set({ ...initialTimerState });
      },

      tick: () => {
        const { isRunning, isPaused, startTimeRef, pausedTimeRef } = get();
        if (isRunning && !isPaused && startTimeRef) {
          const elapsed = Math.floor((Date.now() - startTimeRef) / 1000) + pausedTimeRef;
          set({ elapsedSeconds: elapsed });
        }
      },
    }),
    {
      name: "ca-nexus-timer",
    },
  ),
);

export const useTimerStore = useTimerStoreBase;
export const timerStore = useTimerStoreBase;
