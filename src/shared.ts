export const PERCENTAGE_OF_WALLS = 20;

export enum Kind {
  Empty,
  Wall,
  Start,
  Finish,
  Frontier,
  Reached
}

export enum Direction {
  Up,
  Down,
  Left,
  Right,
  UpRight,
  DownRight,
  UpLeft,
  DownLeft
}

export type MapValues = Kind[][]

export type NodeId = `${number}-${number}`;

export interface PathNode {
  id: NodeId;
  cost: number
}

export interface VisitedNode {
  // Current node ID
  id: NodeId;
  // Where did we came from to reach this node
  cameFrom: NodeId;
  // Direction taken from the last node to get here
  direction: Direction;
  // Total cost from the given path taken to here
  costSoFar: number;
}

export  type PathfinderFunction = (map: MapValues, startNode: NodeId, targetNode: NodeId) => PathfinderSearch
export type PathfinderSearch = Generator<
  // Value returned after each iteration
  { step: number; nodesVisited: VisitedNode[]; nodesToVisit: PathNode[] }, 
  // Value returned after the iterations are done
  { path: VisitedNode[] }, 
  // Possible errors the generator may throw
  unknown
>;

export interface PathfinderHook {
  search: {
    step: number
    nodesToVisit: PathNode[]
    nodesVisited: VisitedNode[]
  },
  searchFns: {
    next: () => void;
    prev: () => void;
    resert: () => void;
  }
}