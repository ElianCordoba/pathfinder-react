import { NodeId } from "../algos/breadthFirst";

export function parseId(id: NodeId): [x: number, y: number] {
  const [x, y] = id.split('-').map(Number)
  return [x, y]
}

export function formatId(x: number, y: number): NodeId {
  return `${x}-${y}`
}