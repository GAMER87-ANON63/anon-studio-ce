import { create } from 'zustand';

export type Asset = {
  id: string;
  name: string;
  dataUrl: string;
};

export type GameObject = {
  id: string;
  type: 'sprite' | 'rectangle' | 'circle' | 'text';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  textureId?: string;
};

export type Condition = {
  id: string;
  type: string;
  params: Record<string, any>;
};

export type Action = {
  id: string;
  type: string;
  params: Record<string, any>;
};

export type EventBlock = {
  id: string;
  conditions: Condition[];
  actions: Action[];
  subEvents: EventBlock[];
};

interface SceneState {
  objects: GameObject[];
  assets: Asset[];
  globalVariables: Record<string, number>;
  selectedIds: string[];
  events: EventBlock[];
  isPlaying: boolean;
  
  addObject: (obj: GameObject) => void;
  updateObject: (id: string, updates: Partial<GameObject>) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  
  addAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;

  setGlobalVariable: (key: string, value: number) => void;

  addEventBlock: () => void;
  removeEventBlock: (id: string) => void;
  addCondition: (eventId: string, condition: Omit<Condition, 'id'>) => void;
  addAction: (eventId: string, action: Omit<Action, 'id'>) => void;
  removeCondition: (eventId: string, conditionId: string) => void;
  removeAction: (eventId: string, actionId: string) => void;
  
  setIsPlaying: (playing: boolean) => void;
}

const defaultAssets: Asset[] = [];

const generateWorld = (): GameObject[] => {
  return [];
};

// Start completely blank
const defaultEvents: EventBlock[] = [];

export const useSceneStore = create<SceneState>((set) => ({
  objects: generateWorld(),
  assets: defaultAssets,
  globalVariables: { Score: 0 },
  selectedIds: [],
  events: defaultEvents,
  isPlaying: false,
  
  addObject: (obj) => set((state) => ({ objects: [...state.objects, obj] })),
  updateObject: (id, updates) => set((state) => ({
    objects: state.objects.map(obj => obj.id === id ? { ...obj, ...updates } : obj)
  })),
  removeObject: (id) => set((state) => ({
    objects: state.objects.filter(obj => obj.id !== id),
    selectedIds: state.selectedIds.filter(selectedId => selectedId !== id)
  })),
  selectObject: (id, multi = false) => set((state) => ({
    selectedIds: multi 
      ? (state.selectedIds.includes(id) ? state.selectedIds.filter(s => s !== id) : [...state.selectedIds, id])
      : [id]
  })),
  clearSelection: () => set({ selectedIds: [] }),
  
  addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
  removeAsset: (id) => set((state) => ({ assets: state.assets.filter(a => a.id !== id) })),

  setGlobalVariable: (key, value) => set((state) => ({ globalVariables: { ...state.globalVariables, [key]: value } })),

  addEventBlock: () => set((state) => ({
    events: [...state.events, { id: `evt-${Date.now()}`, conditions: [], actions: [], subEvents: [] }]
  })),
  removeEventBlock: (id) => set((state) => ({
    events: state.events.filter(e => e.id !== id)
  })),
  addCondition: (eventId, condition) => set((state) => ({
    events: state.events.map(e => e.id === eventId 
      ? { ...e, conditions: [...e.conditions, { ...condition, id: `cond-${Date.now()}` }] }
      : e
    )
  })),
  addAction: (eventId, action) => set((state) => ({
    events: state.events.map(e => e.id === eventId 
      ? { ...e, actions: [...e.actions, { ...action, id: `act-${Date.now()}` }] }
      : e
    )
  })),
  removeCondition: (eventId, conditionId) => set((state) => ({
    events: state.events.map(e => e.id === eventId 
      ? { ...e, conditions: e.conditions.filter(c => c.id !== conditionId) }
      : e
    )
  })),
  removeAction: (eventId, actionId) => set((state) => ({
    events: state.events.map(e => e.id === eventId 
      ? { ...e, actions: e.actions.filter(a => a.id !== actionId) }
      : e
    )
  })),
  
  setIsPlaying: (playing) => set({ isPlaying: playing }),
}));
