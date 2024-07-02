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

export type PathNode = { id: NodeId, cameFrom?: NodeId, direction?: Direction }
export type Reached = Map<NodeId,PathNode >

export type Search = Generator<{ step: number; frontier: NodeId[]; reached: Reached }, { path: PathNode[] | undefined }, unknown>;