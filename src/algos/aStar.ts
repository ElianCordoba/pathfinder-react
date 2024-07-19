import { MapValues, NodeId, PathfinderSearch, VisitedNode } from "../shared";
import { parseId } from "../utils/utils";
import { getValidNeighbors, NodesQueue, reconstructPath } from "./utils";

export function* search(map: MapValues, startNode: NodeId, targetNode: NodeId): PathfinderSearch {
  const toVisit = new NodesQueue(startNode);
  const visited: VisitedNode = new Map();

  let didFindPath = false;
  let step = 0;
  mainLoop: while (!toVisit.done) {
    const current = toVisit.dequeue();
    visited.set(current.id, current);

    // Early exit
    if (current.id === targetNode) {
      didFindPath = true;
      break mainLoop;
    }

    for (const neighbor of getValidNeighbors(map, visited, startNode, current.id)) {
      const seen = toVisit.get(neighbor.id);

      // This is in case we find a better path to and already seen node
      const pathToNeighbour = current.gCost + getDistance(current.id, neighbor.id);

      if (!seen || pathToNeighbour < seen.gCost) {
        const gCost = pathToNeighbour;
        const hCost = getDistance(neighbor.id, targetNode);
        const fCost = gCost + hCost;

        const newEntry = {
          id: neighbor.id,
          gCost,
          hCost,
          fCost,
          cameFrom: current.id,
          direction: neighbor.direction,
        };

        if (!seen) {
          toVisit.enqueue(newEntry);
        } else if (newEntry.fCost < seen.fCost) {
          toVisit.update(newEntry);
        }
      }
    }

    step++;

    yield {
      step,
      nodesVisited: visited,
      nodesToVisit: toVisit.values,
    };
  }

  return { path: didFindPath ? reconstructPath(startNode, targetNode, visited) : [] };
}

// Euclidean distance
function getDistance(p1: NodeId, p2: NodeId): number {
  const aCoords = parseId(p1);
  const bCoords = parseId(p2);

  const a = aCoords[0] - bCoords[0];
  const b = aCoords[1] - bCoords[1];

  return Math.hypot(a, b);
}
