import { Direction, MapValues, NodeId, PathfinderSearch, PathNode, VisitedNode } from "../shared";
import { parseId } from "../utils/utils";
import { getCost, getNeighbors, reconstructPath } from "./utils";

// A full path is a sequence of path segments
interface PathSegment {
  id: NodeId;
  cameFrom: NodeId | undefined;
  gCost: number;
  hCost: number;
  fCost: number;
  direction: Direction | undefined;
}

// Data structure that returns the most promising paths first
class PriorityQueue {
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
      if (targetPriority < element.fCost) {
        break;
      }
      i++;
    }

    return i;
  }

  get(nodeId: NodeId) {
    const found = this.values.find((x) => x.id === nodeId);

   return found
  }

  get done() {
    return this.values.length === 0;
  }
}

export function* search(map: MapValues, startNode: NodeId, targetNode: NodeId): PathfinderSearch {
  // Also known as open or frontier nodes
  const toVisit = new PriorityQueue(startNode);
  // Also known as closed or reached nodes
  const visited: Map<NodeId, PathSegment> = new Map();

  mainLoop: while (!toVisit.done) {
    const current = toVisit.dequeue();
    visited.set(current.id, current);

    // Early exit
    if (current.id === targetNode) {
      break mainLoop;
    }

    for (const neighbor of getNeighbors(map, current.id)) {
      // TODO move into get neibour
      if (visited.has(neighbor.id) || neighbor.id === startNode) {
        continue;
      }

      const wasVisited = toVisit.get(neighbor.id);

      // This is in case we find a better path to and already seen node
      const newPathToNeighbour = current.gCost + getDistance(current.id, neighbor.id);

      if (!wasVisited || newPathToNeighbour < wasVisited.gCost) {
        const gCost = newPathToNeighbour;
        const hCost = getDistance(neighbor.id, targetNode);
        const fCost = gCost + hCost;

        // neighbor.cameFrom = current

        const newEntry = {
          id: neighbor.id,
          gCost,
          hCost,
          fCost,
          cameFrom: current.id,
          direction: neighbor.direction,
        };

        if (!wasVisited) {
          toVisit.enqueue(newEntry);
        } else {
          if (newEntry.fCost < wasVisited.fCost) {
            toVisit.update(newEntry);
          }
        }
      }
    }

    yield {
      nodesVisited: [...visited.values()].map((x) => ({
        cameFrom: x.cameFrom!,
        cost: x.fCost,
        direction: x.direction!,
        id: x.id,
      })),
      nodesToVisit: toVisit.values.map((x) => ({
        cost: x.fCost,
        id: x.id,
      })),
      step: 0,
    };
  }

  return { path: reconstructPath(startNode, targetNode, visited as any) }; //
}

function getDistance(p1: NodeId, p2: NodeId): number {
  const aCoords = parseId(p1);
  const bCoords = parseId(p2);

  const a = aCoords[0] - bCoords[0];
  const b = aCoords[1] - bCoords[1];

  return a * a + b * b;
}
