import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Startup {
  id: string;
  name: string;
  representative: string;
  sector: string;
  needs: string;
  problems: string;
  solutions: string;
  status: 'To Analyze' | 'In Progress' | 'Resolved';
  timeline: TimelineEvent[];
  resources: Resource[];
  diagnostic_results: string | null;
}

export interface TimelineEvent {
  id: string;
  date: string;
  action: string;
  description: string;
  context?: string;
}

export interface Resource {
  id: string;
  type: 'link' | 'document' | 'video';
  url: string;
  title: string;
}

interface StartupStore {
  startups: Startup[];
  loading: boolean;
  fetchStartups: () => Promise<void>;
  addStartup: (startup: Omit<Startup, 'id'>) => Promise<void>;
  updateStartup: (id: string, data: Partial<Startup>) => Promise<void>;
  addTimelineEvent: (startupId: string, event: Omit<TimelineEvent, 'id'>) => Promise<void>;
  addResource: (startupId: string, resource: Omit<Resource, 'id'>) => Promise<void>;
  updateDiagnostic: (startupId: string, diagnosticResults: string) => Promise<void>;
  deleteStartup: (id: string) => Promise<void>;
}

export const useStartupStore = create<StartupStore>((set, get) => ({
  startups: [],
  loading: false,

  fetchStartups: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('startups')
      .select('*');
    
    if (error) {
      console.error('Error fetching startups:', error);
      return;
    }

    set({ startups: data || [], loading: false });
  },

  addStartup: async (startup) => {
    const { data, error } = await supabase
      .from('startups')
      .insert([startup])
      .select();

    if (error) {
      console.error('Error adding startup:', error);
      return;
    }

    set(state => ({
      startups: [...state.startups, data[0]]
    }));
  },

  updateStartup: async (id, data) => {
    const { error } = await supabase
      .from('startups')
      .update(data)
      .eq('id', id);

    if (error) {
      console.error('Error updating startup:', error);
      return;
    }

    set(state => ({
      startups: state.startups.map(s => 
        s.id === id ? { ...s, ...data } : s
      )
    }));
  },

  updateDiagnostic: async (startupId: string, diagnosticResults: string) => {
    const { error } = await supabase
      .from('startups')
      .update({ diagnostic_results: diagnosticResults })
      .eq('id', startupId);

    if (error) {
      console.error('Error updating diagnostic results:', error);
      return;
    }

    set(state => ({
      startups: state.startups.map(s => 
        s.id === startupId ? { ...s, diagnostic_results: diagnosticResults } : s
      )
    }));
  },

  addTimelineEvent: async (startupId, event) => {
    const startup = get().startups.find(s => s.id === startupId);
    if (!startup) return;

    const newEvent = { ...event, id: crypto.randomUUID() };
    const updatedTimeline = [...(startup.timeline || []), newEvent];

    await get().updateStartup(startupId, { timeline: updatedTimeline });
  },

  addResource: async (startupId, resource) => {
    const startup = get().startups.find(s => s.id === startupId);
    if (!startup) return;

    const newResource = { ...resource, id: crypto.randomUUID() };
    const updatedResources = [...(startup.resources || []), newResource];

    await get().updateStartup(startupId, { resources: updatedResources });
  },

  deleteStartup: async (id) => {
    const { error } = await supabase
      .from('startups')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting startup:', error);
      return;
    }

    set(state => ({
      startups: state.startups.filter(s => s.id !== id)
    }));
  },
}));