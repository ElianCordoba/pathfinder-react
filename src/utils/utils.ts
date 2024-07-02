import { Direction, NodeId } from "../shared"

export function assert(condition: boolean) {
  if (!condition) {
    throw new Error('Assertion failed')
  }
}

export function parseId(id: NodeId): [x: number, y: number] {
  const [x, y] = id.split('-').map(Number)
  return [x, y]
}

export function formatId(x: number, y: number): NodeId {
  return `${x}-${y}`
}

export function oppositeDirection(direction: Direction): Direction {
  switch (direction) {
    case Direction.Up: return Direction.Down
    case Direction.Down: return Direction.Up
    case Direction.Left: return Direction.Right
    case Direction.Right: return Direction.Left
    case Direction.UpRight: return Direction.DownLeft
    case Direction.DownRight: return Direction.UpLeft
    case Direction.UpLeft: return Direction.DownRight
    case Direction.DownLeft: return Direction.UpRight
  }
}