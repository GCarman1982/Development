import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GearStore {
  allSets: Record<string, Record<string, any>>;
  activeTab: string;
  theme: 'dark' | 'ffxi';
  searchableItems: Record<string, string[]>;
  searchTerm: string;
  luaCode: string;
  selectedModes: Record<string, string>;
  characterName: string;
  jobName: string;

  // Actions
  setCharacterInfo: (name: string, job: string) => void;
  setTheme: (theme: 'dark' | 'ffxi') => void;
  setActiveTab: (tab: string) => void;
  setSearchTerm: (term: string) => void;
  setLuaCode: (code: string) => void;
  setMode: (mode: string, option: string) => void;
  addSet: (name: string) => void;
  removeSet: (name: string) => void;
  updateSlot: (setName: string, slot: string, item: string) => void;
  clearSet: (setName: string) => void;
  clearSets: () => void;
  initializeItems: (data: Record<string, string[]>) => void;
  importSets: (incomingSets: Record<string, Record<string, any>>) => void;
}

export const useGearStore = create<GearStore>()(
  persist(
    (set) => ({
      // Defaults
      allSets: { "sets.idle": {}, "sets.engaged": {} },
      activeTab: "sets.idle",
      theme: 'dark',
      searchableItems: {},
      searchTerm: "",
      luaCode: "",
      selectedModes: {},
      characterName: "",
      jobName: "",

      // Character Info Action
      setCharacterInfo: (name, job) => set({ characterName: name, jobName: job }),

      initializeItems: (data) => set({ searchableItems: data }),
      setTheme: (theme) => set({ theme }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSearchTerm: (term) => set({ searchTerm: term }),

      setLuaCode: (code) => set((state) => {
        const stateRegex = /state\.(\w+):options\((.*?)\)/g;
        const initialModes: Record<string, string> = {};
        let match;

        while ((match = stateRegex.exec(code)) !== null) {
          const [_, modeName, optionsRaw] = match;
          const firstOption = optionsRaw.split(',')[0].replace(/['"\s]/g, '');
          initialModes[modeName.replace('Mode', '')] = firstOption;
        }

        return { 
          luaCode: code, 
          selectedModes: initialModes 
        };
      }),

      setMode: (mode, option) => set((state) => ({
        selectedModes: { ...state.selectedModes, [mode]: option }
      })),

      clearSets: () => set({ 
        allSets: { "sets.idle": {}, "sets.engaged": {} }, 
        activeTab: "sets.idle",
        searchTerm: "",
        luaCode: "",
        selectedModes: {},
        characterName: "",
        jobName: ""
      }),

      addSet: (name) => set((state) => {
        const cleanName = name.startsWith('sets.') ? name : `sets.${name}`;
        return {
          allSets: { ...state.allSets, [cleanName]: {} },
          activeTab: cleanName 
        };
      }),

      clearSet: (setName) => set((state) => ({
        allSets: { ...state.allSets, [setName]: {} }
      })),

      importSets: (incomingSets) => set((state) => {
        const keys = Object.keys(incomingSets);
        return {
          ...state, 
          allSets: incomingSets,
          activeTab: keys.find(k => k === 'sets.idle') || keys[0] || "sets.idle"
        };
      }),

      removeSet: (setKey) => set((state) => {
        const newSets = { ...state.allSets };
        delete newSets[setKey];

        if (Object.keys(newSets).length === 0) {
          return {
            allSets: { "sets.idle": {}, "sets.engaged": {} },
            activeTab: "sets.idle"
          };
        }

        let nextActiveTab = state.activeTab;
        if (state.activeTab === setKey) {
          nextActiveTab = Object.keys(newSets)[0];
        }

        return { allSets: newSets, activeTab: nextActiveTab };
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
        // We exclude searchableItems and searchTerm from storage to save space
        const { searchableItems, searchTerm, ...rest } = state;
        return rest as GearStore;
      },
    }
  )
);