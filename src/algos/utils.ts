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
  direction: Direction;
  id: [x: number, y: number];
  // cost: number
}

export function getNeighbors(
  map: MapValues,
  node: NodeId
): (NeighborNode & { nodeId: NodeId; stringDirection: string })[] {
  const [x, y] = node.split("-").map(Number);

  const maxX = map[0].length - 1;
  const maxY = map.length - 1;

  function isValid(candidate: NeighborNode) {
    const [_x, _y] = candidate.id;

    if (_x < 0 || _x > maxX || _y < 0 || _y > maxY) {
      return false;
    }

    if (map[_y][_x] === Kind.Wall) {
      return false;
    } else {
      return true;
    }
  }

  const up: NeighborNode = { direction: Direction.Down, id: [x, y - 1] }; //cost: getCost(node, formatId(x, y - 1))
  const down: NeighborNode = { direction: Direction.Up, id: [x, y + 1] }; //cost: getCost(node, formatId(x, y + 1))
  const left: NeighborNode = { direction: Direction.Right, id: [x - 1, y] }; //cost: getCost(node, formatId(x - 1, y))
  const right: NeighborNode = { direction: Direction.Left, id: [x + 1, y] }; //cost: getCost(node, formatId(x + 1, y))

  // The diagonals are only included if we can reach it, for example:
  //
  //  - A X -
  //  - X B -
  //  - - - -
  // We can't go from A to B diagonally

  const neighborsCoords: NeighborNode[] = [up, right, down, left];

  if (isValid(up) || isValid(right)) {
    neighborsCoords.push({ direction: Direction.DownLeft, id: [x + 1, y - 1] });
  }

  if (isValid(down) || isValid(right)) {
    neighborsCoords.push({ direction: Direction.UpLeft, id: [x + 1, y + 1] });
  }

  if (isValid(down) || isValid(left)) {
    neighborsCoords.push({ direction: Direction.UpRight, id: [x - 1, y + 1] });
  }

  if (isValid(up) || isValid(left)) {
    neighborsCoords.push({ direction: Direction.DownRight, id: [x - 1, y - 1] });
  }

  const result: NeighborNode[] = [];

  for (const neighbor of neighborsCoords) {
    const [x, y] = neighbor.id;

    if (x < 0 || x > maxX || y < 0 || y > maxY) {
      continue;
    }

    assert(map[y] !== undefined && map[y][x] !== undefined && map[y][x] !== undefined);

    const node = map[y][x];

    if (node === Kind.Wall) {
      continue;
    }

    result.push(neighbor);
  }

  return result.map((x) => ({ ...x, nodeId: formatId(...x.id), stringDirection: Direction[x.direction] }));
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
      throw new Error("Already seen node");
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