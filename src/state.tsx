import { create } from "zustand";
import { MapControls, MapValues, NodeId, PathfinderSearch, PathSegment } from "./shared";
import { Map as MapClass } from "./utils/map";
import { search } from "./algos/aStar";

export interface AppState {
  initializeMap: (x: number, y: number) => void;
  map: MapValues;
  mapInstance: MapClass;
  setMap: (map: MapValues) => void;
  mapControls: MapControls;
  setMapControls: (mapControls: MapControls) => void;
  startNode: NodeId | null;
  setStartNode: (node: NodeId | null) => void;
  targetNode: NodeId | null;
  setTargetNode: (node: NodeId | null) => void;
}

const useAppState = create<AppState>((set, get) => ({
  initializeMap: (x: number, y: number) => {
    const mapInstance = new MapClass(x, y);
    const mapControls: MapControls = {
      addColumn: () => {
        const didAddColumn = mapInstance.addColum();

        if (!didAddColumn) {
          console.log("Max map size reached");
          return;
        }
        set({ map: didAddColumn });
        usePathfinderState.getState().stopAutomaticSearch();
      },
      addRow: () => {
        const didAddRow = mapInstance.addRow();

        if (!didAddRow) {
          console.log("Max map size reached");
          return;
        }
        set({ map: didAddRow });
        usePathfinderState.getState().stopAutomaticSearch();
      },
      toggleNode: (x: number, y: number) => {
        set({ map: get().mapInstance.toogleNode(x, y) });
        usePathfinderState.getState().stopAutomaticSearch();
      },
      clearMap: () => {
        const newMapInstance = new MapClass(mapInstance.maxX, mapInstance.maxY, 0);

        set({ map: newMapInstance.values });
        set({ mapInstance: newMapInstance });

        usePathfinderState.getState().resetSearch(true);
        usePathfinderState.getState().stopAutomaticSearch();
      },
      randomizeMap: () => {
        const newMapInstance = new MapClass(mapInstance.maxX, mapInstance.maxY);

        set({ map: newMapInstance.values });
        set({ mapInstance: newMapInstance });

        set({ startNode: null });
        set({ targetNode: null });

        usePathfinderState.getState().resetSearch(true);
        usePathfinderState.getState().stopAutomaticSearch();
      },
    };

    set({ map: mapInstance.values });
    set({ mapControls });
    set({ mapInstance });
  },
  map: [[]],
  setMap: (map: MapValues) => set({ map }),
  mapInstance: {} as any,
  mapControls: {} as any,
  setMapControls: (mapControls: MapControls) => set({ mapControls }),
  startNode: null,
  setStartNode: (node: NodeId | null) => set({ startNode: node }),
  targetNode: null,
  setTargetNode: (node: NodeId | null) => set({ targetNode: node }),
}));

interface PathfinderState {
  step: number;
  nodesToVisit: PathSegment[];
  setNodesToVisit: (nodesToVisit: PathSegment[]) => void;
  nodesVisited: Map<string, PathSegment>;
  setNodesVisited: (nodesVisited: Map<string, PathSegment>) => void;
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
  setNodesToVisit: (nodesToVisit: PathSegment[]) => set({ nodesToVisit }),
  nodesVisited: new Map(),
  setNodesVisited: (nodesVisited: Map<string, PathSegment>) => set({ nodesVisited }),
  path: [],

  currentSearch: null,
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
      set({ path: nextStep.value.path });

      if (get().automaticSearchRunning) {
        get().stopAutomaticSearch();
      }
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
