import { NodeId } from "../shared";

export function assert(condition: boolean) {
  if (!condition) {
    throw new Error("Assertion failed");
  }
}

export function parseId(id: string): [x: number, y: number] {
  const [x, y] = id.split("-").map(Number);
  return [x, y];
}

export function formatId(x: number, y: number): NodeId {
  return `${x}-${y}`;
}
