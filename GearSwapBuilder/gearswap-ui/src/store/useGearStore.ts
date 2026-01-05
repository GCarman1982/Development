import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Types ---

export type EquippedItem = {
  name: string;
  augments?: string[];
  rank?: number;
  path?: string;
};

export type GearSet = Record<string, string | EquippedItem>;

interface GearStore {
  allSets: Record<string, GearSet>;
  baseSets: Record<string, string>;
  activeTab: string;
  theme: 'dark' | 'ffxi';
  searchableItems: Record<string, string[]>;
  isLoadingItems: boolean;
  searchTerm: string;
  luaCode: string;
  selectedModes: Record<string, string>;
  characterName: string;
  jobName: string;

  // Modal State
  isAugmentModalOpen: boolean;
  modalTarget: { setName: string; slot: string; item: EquippedItem } | null;

  // Actions
  openAugmentModal: (setName: string, slot: string, item: EquippedItem) => void;
  closeAugmentModal: () => void;
  setCharacterInfo: (name: string, job: string) => void;
  setTheme: (theme: 'dark' | 'ffxi') => void;
  setActiveTab: (tab: string) => void;
  setSearchTerm: (term: string) => void;
  setLuaCode: (code: string) => void;
  setMode: (mode: string, option: string) => void;
  addSet: (name: string, baseSet?: string) => void;
  removeSet: (name: string) => void;
  updateSlot: (setName: string, slot: string, item: string | EquippedItem) => void;
  clearSet: (setName: string) => void;
  clearSets: () => void;
  setIsLoadingItems: (isLoading: boolean) => void;
  initializeItems: (data: Record<string, string[]>) => void;
  importSets: (incomingSets: Record<string, GearSet>, bases?: Record<string, string>) => void;
  updateAugments: (setName: string, slot: string, augs: Partial<EquippedItem>) => void;
  setBaseSets: (bases: Record<string, string>) => void;
}

// --- Store Implementation ---

export const useGearStore = create<GearStore>()(
  persist(
    (set) => ({
      allSets: { "sets.idle": {}, "sets.engaged": {} },
      baseSets: {},
      activeTab: "sets.idle",
      theme: 'dark',
      searchableItems: {},
      isLoadingItems: false,
      searchTerm: "",
      luaCode: "",
      selectedModes: {},
      characterName: "",
      jobName: "",

      isAugmentModalOpen: false,
      modalTarget: null,

      openAugmentModal: (setName, slot, item) => set({
        isAugmentModalOpen: true,
        modalTarget: { setName, slot, item }
      }),

      closeAugmentModal: () => set({
        isAugmentModalOpen: false,
        modalTarget: null
      }),

      setCharacterInfo: (name, job) => set({ characterName: name, jobName: job }),

      setIsLoadingItems: (isLoading) => set({ isLoadingItems: isLoading }),

      initializeItems: (data) => set({ searchableItems: data, isLoadingItems: false }),

      setTheme: (theme) => set({ theme }),

      setActiveTab: (tab) => set({ activeTab: tab }),

      setSearchTerm: (term) => set({ searchTerm: term }),

      setBaseSets: (bases) => set({ baseSets: bases }),

      setLuaCode: (code) => set(() => {
        const stateRegex = /\s*state\.(\w+)\s*:\s*options\s*\((.*?)\)/g;
        const initialModes: Record<string, string> = {};
        let match;

        while ((match = stateRegex.exec(code)) !== null) {
          const [, modeName, optionsRaw] = match;
          // Extract the first option, handling both ' and " and extra spaces
          const firstOptionMatch = optionsRaw.match(/['"](.*?)['"]/);
          if (firstOptionMatch) {
            const mode = modeName.replace('Mode', '');
            // Only set if not already present to avoid overriding user selections
            if (!initialModes[mode]) {
              initialModes[mode] = firstOptionMatch[1];
            }
          }
        }
        return { luaCode: code, selectedModes: initialModes };
      }),

      setMode: (mode, option) => set((state) => ({
        selectedModes: { ...state.selectedModes, [mode]: option }
      })),

      clearSets: () => set({
        allSets: { "sets.idle": {}, "sets.engaged": {} },
        baseSets: {},
        activeTab: "sets.idle",
        searchTerm: "",
        luaCode: "",
        selectedModes: {},
        characterName: "",
        jobName: ""
      }),

      addSet: (name, baseSet) => set((state) => {
        const cleanName = name.startsWith('sets.') ? name : `sets.${name}`;
        const newBases = { ...state.baseSets };
        if (baseSet) {
          newBases[cleanName] = baseSet;
        }
        return {
          allSets: { ...state.allSets, [cleanName]: {} },
          baseSets: newBases,
          activeTab: cleanName
        };
      }),

      clearSet: (setName) => set((state) => ({
        allSets: { ...state.allSets, [setName]: {} }
      })),

      importSets: (incomingSets, bases = {}) => set(() => {
        const keys = Object.keys(incomingSets);
        return {
          allSets: incomingSets,
          baseSets: bases,
          activeTab: keys.find(k => k === 'sets.idle') || keys[0] || "sets.idle"
        };
      }),

      updateAugments: (setName, slot, augs) => set((state) => {
        const current = state.allSets[setName][slot];
        const itemObj: EquippedItem = typeof current === 'string'
          ? { name: current }
          : { ...current };

        return {
          allSets: {
            ...state.allSets,
            [setName]: {
              ...state.allSets[setName],
              [slot]: { ...itemObj, ...augs }
            }
          }
        };
      }),

      removeSet: (setKey) => set((state) => {
        const newSets = { ...state.allSets };
        const newBases = { ...state.baseSets };
        delete newSets[setKey];
        delete newBases[setKey];

        if (Object.keys(newSets).length === 0) {
          return {
            allSets: { "sets.idle": {}, "sets.engaged": {} },
            baseSets: {},
            activeTab: "sets.idle"
          };
        }
        let nextActiveTab = state.activeTab;
        if (state.activeTab === setKey) {
          nextActiveTab = Object.keys(newSets)[0];
        }
        return { allSets: newSets, baseSets: newBases, activeTab: nextActiveTab };
      }),

      updateSlot: (setName, slot, item) => set((state) => ({
        allSets: {
          ...state.allSets,
          [setName]: {
            ...state.allSets[setName],
            [slot]: item,
          }
        }
      })),
    }),
    {
      name: 'gearswap-studio-storage',
      partialize: (state) => {
        const rest = { ...state } as Record<string, unknown>;
        delete rest.searchableItems;
        delete rest.searchTerm;
        delete rest.isLoadingItems;
        delete rest.isAugmentModalOpen;
        delete rest.modalTarget;
        return rest as unknown as GearStore;
      },
    }
  )
);
