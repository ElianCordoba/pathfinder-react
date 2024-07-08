import { Direction, MapValues, NodeId, PathfinderSearch, PathNode, VisitedNode } from "../shared";
import { getCost, getNeighbors, PriorityQueue, reconstructPath } from "./utils";

export function* search(map: MapValues, startNode: NodeId, targetNode: NodeId): PathfinderSearch {
  const nodesToVisit = new PriorityQueue(startNode);
  const nodesVisited: Map<NodeId, VisitedNode> = new Map();

  mainLoop: while (!nodesToVisit.isEmpty()) {
    const currentNode = nodesToVisit.dequeue();

    // Early exit
    if (currentNode.id === targetNode) {
      break mainLoop;
    }

    for (const neighbor of getNeighbors(map, currentNode.id)) {
      if (neighbor.nodeId === startNode) {
        continue;
      }

      const wasNodeVisited = nodesVisited.get(neighbor.nodeId);
      const cost = getDijkstraCost(currentNode, neighbor);

      // The second check is in place in case we find a better path to and already seen node
      if (!wasNodeVisited || cost < wasNodeVisited.cost) {
        nodesToVisit.enqueue({
          id: neighbor.nodeId,
          cost,
        });

        nodesVisited.set(neighbor.nodeId, {
          id: neighbor.nodeId,
          cameFrom: currentNode.id,
          cost: cost,
          direction: neighbor.direction,
        });
      }
    }

    yield { nodesVisited: [...nodesVisited.values()], nodesToVisit: nodesToVisit.toArray(), step: 0 };
  }

  return { path: reconstructPath(startNode, targetNode, nodesVisited) };
}

function getDijkstraCost(currentNode: PathNode, neighbor: any): number {
  const costSoFar = currentNode.cost;

  const movedDiagonally = neighbor.direction > Direction.Right;
  // Distance between start node and neibour
  const costOfVisitingNeibour = getCost(currentNode.id, neighbor.nodeId, movedDiagonally);
  return costSoFar + costOfVisitingNeibour;
}

