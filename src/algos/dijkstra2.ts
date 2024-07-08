import { Direction, Kind, MapValues, NodeId, PathfinderSearch, PathNode, VisitedNode } from "../shared";
import { assert, formatId } from "../utils/utils";
import { getCost } from "./utils";

// reached = nodesVisited = candidate paths = discovered nodes

export function* search(map: MapValues, startNode: NodeId, targetNode: NodeId): PathfinderSearch {
  const nodesToVisit = new PriorityQueue(startNode);
  const nodesVisited: Map<NodeId, VisitedNode> = new Map();

  mainLoop: while (!nodesToVisit.isEmpty()) {
    const currentNode = nodesToVisit.dequeue();

    // Early exit
    if (currentNode.value.id === targetNode) {
      break mainLoop;
    }

    const neighbors = getNeighbors(map, currentNode.value.id);

    for (const neighbor of neighbors) {
      if (neighbor.nodeId === startNode) {
        continue;
      }

      // // Early exit
      // if (neighbor.nodeId === targetNode) {
      //   break mainLoop;
      // }

      const movedDiagonally = neighbor.direction > Direction.Right;
      const constToVisitNeibour = getCost(currentNode.value.id, neighbor.nodeId, movedDiagonally);
      const wasNodeVisited = nodesVisited.get(neighbor.nodeId);

      const newBestCost = currentNode.value.cost + constToVisitNeibour

      if (!wasNodeVisited || newBestCost < wasNodeVisited.costSoFar) {
        nodesToVisit.enqueue({
          id: neighbor.nodeId,
          cost: newBestCost,
          cameFrom: currentNode.value.id,
          direction: currentNode.value.direction,
        });

        nodesVisited.set(neighbor.nodeId, {
          id: neighbor.nodeId,
          cameFrom: currentNode.value.id,
          costSoFar: newBestCost,
          directionTaken: currentNode.value.direction,
        });
      }
    }

    yield { nodesVisited: [...nodesVisited.values()], nodesToVisit: nodesToVisit.toArray(), step: 0 };
  }

  return { path: reconstructPath(startNode, targetNode, nodesVisited) };
}

export function reconstructPath(startNode: NodeId, targetNode: NodeId, visitedNodes: Map<NodeId, VisitedNode>) {
  if (visitedNodes.size === 0) {
    return [];
  }

  const start: Partial<VisitedNode> = { id: startNode, costSoFar: 0 };
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

  const up: NeighborNode = { direction: Direction.Up, id: [x, y - 1] }; //cost: getCost(node, formatId(x, y - 1))
  const down: NeighborNode = { direction: Direction.Down, id: [x, y + 1] }; //cost: getCost(node, formatId(x, y + 1))
  const left: NeighborNode = { direction: Direction.Left, id: [x - 1, y] }; //cost: getCost(node, formatId(x - 1, y))
  const right: NeighborNode = { direction: Direction.Right, id: [x + 1, y] }; //cost: getCost(node, formatId(x + 1, y))

  // The diagonals are only included if we can reach it, for example:
  //
  //  - A X -
  //  - X B -
  //  - - - -
  // We can't go from A to B diagonally

  const neighborsCoords: NeighborNode[] = [up];

  if (isValid(up) || isValid(right)) {
    neighborsCoords.push({ direction: Direction.UpRight, id: [x + 1, y - 1] });
  }

  neighborsCoords.push(right);

  if (isValid(down) || isValid(right)) {
    neighborsCoords.push({ direction: Direction.DownRight, id: [x + 1, y + 1] });
  }

  neighborsCoords.push(down);

  if (isValid(down) || isValid(left)) {
    neighborsCoords.push({ direction: Direction.DownLeft, id: [x - 1, y + 1] });
  }

  neighborsCoords.push(left);

  if (isValid(up) || isValid(left)) {
    neighborsCoords.push({ direction: Direction.UpLeft, id: [x - 1, y - 1] });
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

class PriorityQueue {
  values: Element[] = [];

  constructor(startNode: NodeId) {
    this.values.push({
      priority: 0,
      value: {
        id: startNode,
        cost: 0,
        cameFrom: undefined as any,
        direction: undefined as any,
      },
    });
  }

  enqueue(element: PathNode) {
    const nodeAlreadyEnqueued = this.values.findIndex((x) => x.value.id === element.id);

    if (nodeAlreadyEnqueued !== -1) {
      console.log("REMOVING EXISTING");
      this.values.splice(nodeAlreadyEnqueued, 1);
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
    return this.values.shift()!;
  }

  isEmpty() {
    return this.values.length === 0;
  }

  toArray() {
    return this.values.map((x) => x.value);
  }
}
