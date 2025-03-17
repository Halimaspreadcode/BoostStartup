import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Database } from '../types/supabase';

export type StartupStatus = 'To Analyze' | 'In Progress' | 'Resolved';
export type Startup = Database['public']['Tables']['startups']['Row'] & {
  status: StartupStatus;
  created_at: string | null;
  updated_at: string | null;
};

export interface TimelineEvent {
  id: string;
  date: string;
  action: string;
  description: string;
  context?: string;
}

export interface Step {
  id: string;
  name: string;
  startups: string[];
  actions: string[];
  interviews: Record<string, string>;
  results?: {
    startupId: string;
    actionId: string;
    response: string;
    summary?: string;
  }[];
}

interface WorkspaceStore {
  steps: Step[];
  activeStep: string | null;
  currentPhase: 'diagnostic' | 'solutions';
  addStep: (step: Omit<Step, 'id'>) => void;
  removeStep: (id: string) => void;
  updateStep: (id: string, data: Partial<Step>) => void;
  setActiveStep: (id: string | null) => void;
  setCurrentPhase: (phase: 'diagnostic' | 'solutions') => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      steps: [],
      activeStep: null,
      currentPhase: 'diagnostic',

      addStep: (step) => set((state) => ({
        steps: [...state.steps, { ...step, id: crypto.randomUUID() }]
      })),

      removeStep: (id) => set((state) => ({
        steps: state.steps.filter((s) => s.id !== id)
      })),

      updateStep: (id, data) => set((state) => ({
        steps: state.steps.map((s) => (s.id === id ? { ...s, ...data } : s))
      })),

      setActiveStep: (id) => set({ activeStep: id }),

      setCurrentPhase: (phase) => set({ currentPhase: phase })
    }),
    {
      name: 'workspace-storage',
      version: 1
    }
  )
); 