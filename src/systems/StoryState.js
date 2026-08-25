import { create } from 'zustand'

// ---------------------------------------------------------------------------
// StoryState -- the single source of truth for where the player is and what
// they have discovered. Scene-to-scene transition *timing* is orchestrated
// imperatively in App.jsx (via SceneTransition's fade); this store just
// holds the resulting state.
// ---------------------------------------------------------------------------

export const DOORS = [
  { id: 'morning', label: '06:42', scene: 'MorningScene' },
  { id: 'train', label: 'LAST TRAIN', scene: 'TrainScene' },
  { id: 'childhood', label: '2012', scene: 'ChildhoodScene' },
  { id: 'room404', label: 'ROOM 404', scene: 'Room404Scene' },
  { id: 'home', label: 'HOME', scene: 'HomeScene' },
]

export const useStory = create((set, get) => ({
  view: 'loading', // loading | intro | hallway | morning | train | childhood | room404 | home

  visitedDoors: {
    morning: false,
    train: false,
    childhood: false,
    room404: false,
    home: false,
  },

  cluesFound: {
    photograph: false,
    suitcase: false,
    calendar: false,
    mirror: false,
  },

  audioReady: false,

  setView: (view) => set({ view }),

  enterExperience: () => set({ view: 'hallway' }),

  visitDoor: (id) =>
    set((state) => ({
      view: id,
      visitedDoors: { ...state.visitedDoors, [id]: true },
    })),

  foundClue: (key) => set((state) => ({ cluesFound: { ...state.cluesFound, [key]: true } })),

  setAudioReady: (v) => set({ audioReady: v }),

  progress: () => {
    const v = Object.values(get().visitedDoors)
    return v.filter(Boolean).length / v.length
  },
}))
