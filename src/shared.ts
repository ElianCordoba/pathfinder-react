export const PERCENTAGE_OF_WALLS = 30;

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

export  type PathfinderFunction = (map: MapValues, startNode: NodeId, targetNode: NodeId) => PathfinderSearch
export type PathfinderSearch = Generator<
  // Value returned after each iteration
  { step: number; nodesVisited: VisitedNode; nodesToVisit: PathSegment[] }, 
  // Value returned after the iterations are done
  { path: PathSegment[] }, 
  // Possible errors the generator may throw
  never
>;

// export interface PathfinderHook {
//   search: {
//     step: number
//     nodesToVisit: PathNode[]
//     nodesVisited: VisitedNode[]
//   },
//   searchFns: {
//     next: () => void;
//     prev: () => void;
//     resert: () => void;
//   }
// }

export type VisitedNode = Map<NodeId, PathSegment>

// A full path is a sequence of path segments
export interface PathSegment {
  id: NodeId;
  cameFrom: NodeId | undefined;
  gCost: number;
  hCost: number;
  fCost: number;
  direction: Direction | undefined;
}