import { Direction, Kind, MapValues, NodeId, PathNode, Reached, PathfinderSearch } from "../shared";
import { assert, formatId, oppositeDirection } from "../utils/utils";
import { getNeighbors, reconstructPath } from "./utils";

export function* search(map: MapValues, startNode: NodeId, targetNode: NodeId): PathfinderSearch {
  // Next to visit nodes
  const frontier: NodeId[] = [startNode];
  // List of visited nodes
  const reached: Reached = new Map();

  let step = 0;

  mainLoop: while (frontier.length !== 0) {
    const currentNode = frontier.shift()!;

    if (currentNode === targetNode) {
      console.log('Early exit')
      break mainLoop
    }

    for (const neighbor of getNeighbors(map, currentNode)) {
      const nextNodeId = formatId(...neighbor.id);

      if (nextNodeId === startNode) {
        continue
      }

      if (!reached.has(nextNodeId)) {
        frontier.push(nextNodeId);
        reached.set(nextNodeId, { id: nextNodeId, cameFrom: currentNode, direction: neighbor.direction, cost: 0 });
      }
    }
    step++;
    yield { step, frontier, reached };
  }

  return {
    path: reached.size ? reconstructPath(startNode, targetNode, reached) : undefined
  }  
}


