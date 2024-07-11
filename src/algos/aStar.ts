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
  values: { priority: number; value: PathSegment }[] = [];

  constructor(startNode: NodeId) {
    this.values.push({
      priority: 0,
      value: {
        id: startNode,
        cameFrom: undefined,
        gCost: 0,
        hCost: 0,
        fCost: 0,
        direction: undefined
      },
    });
  }

  dequeue() {
    return this.values.shift()!.value;
  }

  enqueue(element: PathSegment) {
    const nodeAlreadyEnqueued = this.values.findIndex((x) => x.value.id === element.id);

    if (nodeAlreadyEnqueued !== -1) {
      throw new Error("Already seen node");
      // this.values.splice(nodeAlreadyEnqueued, 1)
    }

    const newEntry = {
      priority: element.fCost,
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

  get(nodeId: NodeId) {
    const found = this.values.find((x) => x.value.id === nodeId);

    if (found) {
      return found.value;
    } else {
      return undefined;
    }
  }

  get hasNodesToVisit() {
    return this.values.length !== 0;
  }

  toArray() {
    return this.values.map((x) => x.value);
  }
}

export function* search(map: MapValues, startNode: NodeId, targetNode: NodeId): PathfinderSearch {
  // Open | Frontier
  const toVisit = new PriorityQueue(startNode);
  // Closed | Reached
  const visited: Map<NodeId, PathSegment> = new Map();

  mainLoop: while (toVisit.hasNodesToVisit) {
    const current = toVisit.dequeue();
    visited.set(current.id, current);

    // Early exit
    if (current.id === targetNode) {
      break mainLoop;
    }

    for (const neighbor of getNeighbors(map, current.id)) {
      // TODO move into get neibour
      if (visited.has(neighbor.nodeId) || neighbor.nodeId === startNode) {
        continue;
      }

      const wasVisited = toVisit.get(neighbor.nodeId);

      // This is in case we find a better path to and already seen node
      const newPathToNeighbour = current.gCost + getDistance(current.id, neighbor.nodeId);

      if (!wasVisited || newPathToNeighbour < wasVisited.gCost) {
        const gCost = newPathToNeighbour;
        const hCost = getDistance(neighbor.nodeId, targetNode);
        const fCost = gCost + hCost;

        // neighbor.cameFrom = current

        if (!wasVisited) {
          toVisit.enqueue({
            id: neighbor.nodeId,
            gCost,
            hCost,
            fCost,
            cameFrom: current.id,
            direction: neighbor.direction
          });
        }
      }
    }

    yield {
      nodesVisited: [...visited.values()].map((x) => ({
        cameFrom: x.cameFrom!,
        cost: x.fCost,
        direction: x.direction,
        id: x.id,
      })),
      nodesToVisit: toVisit.toArray().map(x => ({ 
        cost: x.fCost,
        id: x.id
      })),
      step: 0,
    };
  }

  return { path: reconstructPath(startNode, targetNode, visited as any) };//
}

function getDistance(p1: NodeId, p2: NodeId): number {
  const aCoords = parseId(p1);
  const bCoords = parseId(p2);

  const a = aCoords[0] - bCoords[0];
  const b = aCoords[1] - bCoords[1];

  return a * a + b * b;
}
