import { create } from "zustand";
import { Kind, MAP_KEY, MapValues, NodeId, PathfinderSearch, PathSegment, PersistedMapState } from "./shared";
import { Map as MapClass } from "./utils/map";
import { search } from "./algos/aStar";
import { parseId } from "./utils/utils";

export interface AppState {
  loadOrInitializeMap: () => void;
  initializeMap: (x: number, y: number) => void;
  loadMap: (serializedMap: string) => void;
  persistMap(): void;
  map: MapValues;
  mapInstance: MapClass;
  startNode: NodeId | null;
  targetNode: NodeId | null;

  // Map controls
  addColumn: () => void;
  addRow: () => void;
  toggleNode: (id: NodeId) => void;
  clearMap: () => void;
  randomizeMap: () => void;
}

const useAppState = create<AppState>((set, get) => ({
  loadOrInitializeMap: () => {
    const storedMap = localStorage.getItem(MAP_KEY);

    if (storedMap) {
      console.log("Loaded map from local storage");
      get().loadMap(storedMap);
    } else {
      console.log("Initialized map");
      get().initializeMap(15, 10);
    }
  },
  initializeMap: (x: number, y: number) => {
    const mapInstance = new MapClass(x, y);

    set({ map: mapInstance.values });
    set({ mapInstance });
  },
  loadMap(serializedMap: string) {
    const { startNode, targetNode, map } = JSON.parse(serializedMap) as PersistedMapState;

    const mapInstance = new MapClass(0, 0, 0, true);
    mapInstance.values = map;

    set({ map, mapInstance, startNode, targetNode });
  },
  persistMap() {
    console.log("Persisting map");
    const { map, startNode, targetNode } = get();
    const state = { map, startNode, targetNode };
    localStorage.setItem(MAP_KEY, JSON.stringify(state));
  },
  map: [[]],
  mapInstance: {} as any,
  startNode: null,
  targetNode: null,
  addColumn() {
    const didAddColumn = get().mapInstance.addColum();

    if (!didAddColumn) {
      console.log("Max map size reached");
      return;
    }

    set({ map: didAddColumn });

    usePathfinderState.getState().stopAutomaticSearch();
  },
  addRow() {
    const didAddRow = get().mapInstance.addRow();

    if (!didAddRow) {
      console.log("Max map size reached");
      return;
    }

    set({ map: didAddRow });

    usePathfinderState.getState().stopAutomaticSearch();
  },
  toggleNode(nodeId: NodeId) {
    const { startNode, targetNode } = get();

    if (startNode === nodeId || targetNode === nodeId) {
      return;
    }

    const [x, y] = parseId(nodeId);
    const map = get().mapInstance.toogleNode(x, y);

    set({ map });

    usePathfinderState.getState().stopAutomaticSearch();
  },
  clearMap: () => {
    const { maxX, maxY } = get().mapInstance;
    const newMapInstance = new MapClass(maxX, maxY, 0);

    set({ map: newMapInstance.values });
    set({ mapInstance: newMapInstance });

    usePathfinderState.getState().resetSearch(true);
    usePathfinderState.getState().stopAutomaticSearch();
  },
  randomizeMap: () => {
    const { maxX, maxY } = get().mapInstance;
    const newMapInstance = new MapClass(maxX, maxY);

    set({ map: newMapInstance.values });
    set({ mapInstance: newMapInstance });

    set({ startNode: null });
    set({ targetNode: null });

    usePathfinderState.getState().resetSearch(true);
    usePathfinderState.getState().stopAutomaticSearch();
  },
}));

// Automatically persist the state
const changesToPersist: (keyof AppState)[] = ["map", "startNode", "targetNode"];
useAppState.subscribe((state, prevState) => {
  for (const key of changesToPersist) {
    if (state[key] !== prevState[key]) {
      useAppState.getState().persistMap();
      break;
    }
  }
});

interface PathfinderState {
  step: number;
  nodesToVisit: PathSegment[];
  nodesVisited: Map<string, PathSegment>;
  path: PathSegment[];

  currentSearch: PathfinderSearch | null;
  nextStep: () => void;
  resetSearch: (fullReset?: boolean) => void;

  automaticSearchRunning: number | null;
  startAutomaticSearch: () => void;
  stopAutomaticSearch: () => void;
}

export const usePathfinderState = create<PathfinderState>((set, get) => ({
  step: -1,
  nodesToVisit: [],
  nodesVisited: new Map(),
  path: [],
  currentSearch: null,
  searchDone: false,
  nextStep: () => {
    // This state usage is required when reading a state from another state
    const startNode = useAppState.getState().startNode;
    const targetNode = useAppState.getState().targetNode;

    if (!startNode || !targetNode) {
      console.log("Refused to start calculation as start and / or finish nodes are not set");
      return;
    }

    let currentSearch = get().currentSearch;

    if (!currentSearch) {
      console.log("No search started");

      const map = useAppState.getState().map;

      const newSearch = search(map, startNode, targetNode);

      currentSearch = newSearch;
      set({ currentSearch: newSearch });
    }

    const nextStep = currentSearch!.next();
    if (nextStep.done) {
      if (nextStep.value) {
        set({ path: nextStep.value.path });
      }

      get().stopAutomaticSearch();
    } else {
      const { step, nodesToVisit, nodesVisited } = nextStep.value;
      set({ step });
      set({ nodesToVisit });
      set({ nodesVisited });
    }
  },
  resetSearch: (fullReset) => {
    set({ currentSearch: null });
    set({ nodesToVisit: [] });
    set({ nodesVisited: new Map() });
    set({ path: [] });

    // Done when reseting the seach with shift pressed
    if (fullReset) {
      useAppState.setState({ startNode: null, targetNode: null });
    }

    get().stopAutomaticSearch();
  },

  automaticSearchRunning: null,
  startAutomaticSearch: () => {
    // const { automaticSearchRunning, path } = get();

    // if (automaticSearchRunning || path.length) {
    //   return;
    // }

    const interval = setInterval(() => {
      get().nextStep();
    }, 50);
    set({ automaticSearchRunning: interval });
  },
  stopAutomaticSearch: () => {
    clearInterval(get().automaticSearchRunning!);
    set({ automaticSearchRunning: null });
  },
}));

export { useAppState };
