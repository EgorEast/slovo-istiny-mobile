import { create } from 'zustand';
import type { Sermon } from 'shared/api';

interface SermonsState {
  sermons: Sermon[];
  addSermon: (newSermon: Sermon) => void;
}

export const useSermonsStore = create<SermonsState>((set) => ({
  sermons: [
    { id: 1, title: 'Проповедь 1', url: 'http://placeholder.com' },
    { id: 2, title: 'Проповедь 2', url: 'http://placeholder.com' },
    { id: 3, title: 'Проповедь 3', url: 'http://placeholder.com' },
    { id: 4, title: 'Проповедь 4', url: 'http://placeholder.com' },
    { id: 5, title: 'Проповедь 5', url: 'http://placeholder.com' },
    { id: 6, title: 'Проповедь 6', url: 'http://placeholder.com' },
    { id: 7, title: 'Проповедь 7', url: 'http://placeholder.com' },
    { id: 8, title: 'Проповедь 8', url: 'http://placeholder.com' },
    { id: 9, title: 'Проповедь 9', url: 'http://placeholder.com' },
  ],

  addSermon: (newSermon: Sermon) => set((state) => ({ sermons: [...state.sermons, newSermon] })),
}));
