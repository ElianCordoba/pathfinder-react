import { Direction, MapValues, NodeId, Kind, PathNode, VisitedNode, PathSegment } from "../shared";
import { assert, formatId, parseId } from "../utils/utils";

/**
 * Data structure that returns the most promising paths first
 */
export class NodesQueue {
  values: PathSegment[] = [];

  constructor(startNode: NodeId) {
    this.values.push({
      id: startNode,
      cameFrom: undefined,
      gCost: 0,
      hCost: 0,
      fCost: 0,
      direction: undefined,
    });
  }

  dequeue() {
    return this.values.shift()!;
  }

  enqueue(segment: PathSegment) {
    const nodeAlreadyEnqueued = this.values.findIndex((x) => x.id === segment.id);

    if (nodeAlreadyEnqueued !== -1) {
      throw new Error("Already seen node");
      // this.values.splice(nodeAlreadyEnqueued, 1)
    }

    const indexToInsert = this.findIndexToInsert(segment.fCost);

    this.values.splice(indexToInsert, 0, segment);
  }

  update(segment: PathSegment) {
    const index = this.values.findIndex((x) => x.id === segment.id);

    if (index === -1) {
      throw new Error("Index not found" + index);
    }

    this.values[index] = segment;
  }

  findIndexToInsert(targetPriority: number) {
    let i = 0;
    for (const element of this.values) {
      // TODO handle case where fCost is the same
      if (targetPriority < element.fCost) {
        break;
      }
      i++;
    }

    return i;
  }

  get(nodeId: NodeId) {
    const found = this.values.find((x) => x.id === nodeId);

    return found;
  }

  get done() {
    return this.values.length === 0;
  }
}

export function reconstructPath(startNode: NodeId, targetNode: NodeId, visitedNodes: VisitedNode): PathSegment[] {
  if (visitedNodes.size === 0) {
    return [];
  }

  const start = { id: startNode, cost: 0 } as any
  const target = { id: targetNode, cameFrom: targetNode } as Partial<PathSegment>;

  let current = target as PathSegment;
  const path: PathSegment[] = [];

  while (current.id !== start.id) {
    current = visitedNodes.get(current.cameFrom!)!;

    if (!current) {
      break;
    }

    path.push(current);
  }

  path.push(start);
  return path.reverse();
}

export interface NeighborNode {
  id: NodeId;
  x: number;
  y: number;
  direction: Direction;
}

/**
 * This function get all the _valid_ neighbors of a given node, this means that automatically skips non-walkable nodes,
 * as well as already visited ones and the start node
 */
export function getValidNeighbors(map: MapValues, visited: Map<NodeId, PathSegment>, startNode: NodeId, node: NodeId): NeighborNode[] {
  const [x, y] = node.split("-").map(Number);

  const maxX = map[0].length - 1;
  const maxY = map.length - 1;

  function isValid(candidate: { x: number; y: number }) {
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
    const { x, y } = neighbor as NeighborNode;

    if (x < 0 || x > maxX || y < 0 || y > maxY) {
      continue;
    }

    assert(map[y] !== undefined && map[y][x] !== undefined && map[y][x] !== undefined);

    const node = map[y][x];

    if (node === Kind.Wall) {
      continue;
    }

    const id = formatId(x, y);

    if (visited.has(id) || id === startNode) {
      continue
    }

    result.push({ ...neighbor, id } as NeighborNode);
  }

  return result;
}
