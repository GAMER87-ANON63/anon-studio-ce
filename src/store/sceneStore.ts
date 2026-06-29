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

interface SceneState {
  objects: GameObject[];
  assets: Asset[];
  globalVariables: Record<string, number>;
  selectedIds: string[];
  code: string;
  isPlaying: boolean;
  
  addObject: (obj: GameObject) => void;
  updateObject: (id: string, updates: Partial<GameObject>) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  
  addAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;

  setGlobalVariable: (key: string, value: number) => void;

  setCode: (code: string) => void;
  
  setIsPlaying: (playing: boolean) => void;
}

const defaultAssets: Asset[] = [];

const generateWorld = (): GameObject[] => {
  return [];
};

const defaultCode = `// A# (A Sharp) Game Scripting
// Access objects via global array: objects
// Access variables via global array: variables

function update() {
  // Add your logic here
  
}
`;

export const useSceneStore = create<SceneState>((set) => ({
  objects: generateWorld(),
  assets: defaultAssets,
  globalVariables: { Score: 0 },
  selectedIds: [],
  code: defaultCode,
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

  setCode: (code) => set({ code }),

  setIsPlaying: (isPlaying) => set({ isPlaying })
}));
