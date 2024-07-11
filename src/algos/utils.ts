import { Direction, MapValues, NodeId, Kind, PathNode, VisitedNode } from "../shared";
import { assert, formatId, parseId } from "../utils/utils";

export function reconstructPath(startNode: NodeId, targetNode: NodeId, visitedNodes: Map<NodeId, VisitedNode>) {
  if (visitedNodes.size === 0) {
    return [];
  }

  const start: Partial<VisitedNode> = { id: startNode, cost: 0 };
  const target: Partial<VisitedNode> = { id: targetNode, cameFrom: targetNode };

  let current = target;
  const path: VisitedNode[] = [];

  while (current.id !== start.id) {
    current = visitedNodes.get(current.cameFrom!)!;

    if (!current) {
      break;
    }

    path.push(current as VisitedNode);
  }

  path.push(start as VisitedNode);
  return path.reverse(); //.map(x => ({ ...x, direction: oppositeDirection(x.direction!) }))
}

interface NeighborNode {
  id: NodeId;
  x: number;
  y: number;
  direction: Direction;
}

export function getNeighbors(
  map: MapValues,
  node: NodeId
): NeighborNode[] {
  const [x, y] = node.split("-").map(Number);

  const maxX = map[0].length - 1;
  const maxY = map.length - 1;

  function isValid(candidate: { x: number, y: number }) {
    if (candidate.x < 0 || candidate.x > maxX || candidate.y < 0 || candidate.y > maxY) {
      return false;
    }

    if (map[candidate.y][candidate.x] === Kind.Wall) {
      return false;
    } else {
      return true;
    }
  }

  const up = { direction: Direction.Down, x, y: y - 1 };
  const down = { direction: Direction.Up, x, y: y + 1 };
  const left = { direction: Direction.Right, x: x - 1, y };
  const right = { direction: Direction.Left, x: x + 1, y };

  // The diagonals are only included if we can reach it, for example:
  //
  //  - A X -
  //  - X B -
  //  - - - -
  // We can't go from A to B diagonally

  const neighborsCoords: Partial<NeighborNode>[] = [up, right, down, left];

  if (isValid(up) || isValid(right)) {
    neighborsCoords.push({ direction: Direction.DownLeft, x: x + 1, y: y - 1 });
  }

  if (isValid(down) || isValid(right)) {
    neighborsCoords.push({ direction: Direction.UpLeft, x: x + 1, y: y + 1 });
  }

  if (isValid(down) || isValid(left)) {
    neighborsCoords.push({ direction: Direction.UpRight, x: x - 1, y: y + 1 });
  }

  if (isValid(up) || isValid(left)) {
    neighborsCoords.push({ direction: Direction.DownRight, x: x - 1, y: y - 1 });
  }

  const result: NeighborNode[] = [];

  for (const neighbor of neighborsCoords) {
    const { x, y } = neighbor as NeighborNode

    if (x < 0 || x > maxX || y < 0 || y > maxY) {
      continue;
    }

    assert(map[y] !== undefined && map[y][x] !== undefined && map[y][x] !== undefined);

    const node = map[y][x];

    if (node === Kind.Wall) {
      continue;
    }

    result.push({ ...neighbor, id: formatId(x, y) } as NeighborNode);
  }

  return result;
}

interface Element {
  priority: number;
  value: PathNode;
}

export class PriorityQueue {
  values: Element[] = [];

  constructor(startNode: NodeId) {
    this.values.push({
      priority: 0,
      value: {
        id: startNode,
        cost: 0,
      },
    });
  }

  enqueue(element: PathNode) {
    const nodeAlreadyEnqueued = this.values.findIndex((x) => x.value.id === element.id);

    if (nodeAlreadyEnqueued !== -1) {
      // throw new Error("Already seen node");
      this.values.splice(nodeAlreadyEnqueued, 1)
    }

    const newEntry = {
      priority: element.cost,
      value: element,
    };
    const indexToInsert = this.findIndexToInsert(newEntry.priority);

    this.values.splice(indexToInsert, 0, newEntry);
  }

  findIndexToInsert(targetPriority: number) {
    let i = 0;
    for (const element of this.values) {
      if (targetPriority < element.priority) {
        break;
      }
      i++;
    }

    return i;
  }

  dequeue() {
    return this.values.shift()!.value;
  }

  isEmpty() {
    return this.values.length === 0;
  }

  toArray() {
    return this.values.map((x) => x.value);
  }
}

export function getCost(a: NodeId, b: NodeId, isDiagonal: boolean) {
  const aCoords = parseId(a)
  const bCoords = parseId(b)
  
   // Manhattan distance on a square grid
   const res = Math.abs(aCoords[0] - bCoords[0]) + Math.abs(aCoords[1] - bCoords[1])

   if (isDiagonal) {
    return res / 2
   } else {
    return res
   }

}