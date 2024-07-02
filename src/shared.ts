export const PERCENTAGE_OF_WALLS = 20;

export enum Kind {
  Empty,
  Wall,
  Start,
  Finish,
  Frontier,
  Reached
}

export type MapValues = Kind[][]

export type NodeId = `${number}-${number}`;

export type Search = Generator<{ step: number; frontier: NodeId[]; reached: NodeId[] }, void, unknown>;