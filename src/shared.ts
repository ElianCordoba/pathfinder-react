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

export type PathNode = { id: NodeId, cameFrom?: NodeId, costSoFar: number, direction?: Direction }
export type Reached = Map<NodeId,PathNode >

export  type PathfinderFunction = (map: MapValues, startNode: NodeId, targetNode: NodeId) => PathfinderSearch
export type PathfinderSearch = Generator<
  // Value returned after each iteration
  { step: number; frontier: NodeId[]; reached: Reached }, 
  // Value returned after the iterations are done
  { path: PathNode[] | undefined }, 
  // Possible errors the generator may throw
  unknown
>;

export interface PathfinderHook {
  search: {
    step: number
    frontier: NodeId[],
    reached: Reached
  },
  searchFns: {
    next: () => void;
    prev: () => void;
    resert: () => void;
  }
}