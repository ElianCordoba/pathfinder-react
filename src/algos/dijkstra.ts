import { Direction, MapValues, NodeId, Reached, PathfinderSearch } from "../shared";
import { formatId } from "../utils/utils";
import { getCost, getNeighbors, reconstructPath } from "./utils";

export function* search(map: MapValues, startNode: NodeId, targetNode: NodeId): PathfinderSearch {
  const frontier = new PriorityQueue(startNode);

  const reached: Reached = new Map();
  // const costs: Map<NodeId, number> = new Map([[startNode, 0]]);

  let step = 0;

  while (!frontier.isEmpty()) {
    const currentNode = frontier.dequeue()!;

    if (currentNode.value.id === targetNode) {
      console.log("Early exit");
      break;
    }

    for (const neighbor of getNeighbors(map, currentNode.value.id)) {
      const nextNodeId = formatId(...neighbor.id);
      const neighborCost = getCost(currentNode.value.id, nextNodeId);

      const reachedBefore = reached.get(nextNodeId);
      const newCost = currentNode.value.cost + neighborCost;

      if (!reachedBefore || newCost < reachedBefore.cost) {
        reached.set(nextNodeId, {
          id: nextNodeId,
          cameFrom: currentNode.value.id,
          direction: neighbor.direction,
          cost: newCost,
        });

        frontier.enqueue({
          id: nextNodeId,
          cameFrom: currentNode.value.id,
          direction: currentNode.value.direction,
        }, );
      }
    }
    step++;
    yield { step, frontier: frontier.toArray(), reached };
  }

  return {
    path: reached.size ? reconstructPath(startNode, targetNode, reached) : undefined,
  };
}

interface Element {
  priority: number;
  value: PathNode;
}

export interface PathNode {
  id: NodeId;
  cameFrom: NodeId;
  direction: Direction;
  cost: number
}

export class PriorityQueue {
  values: Element[] = [];

  constructor(startNode: NodeId) {
    this.values.push({
      priority: 0,
      value: {
        id: startNode,
        cost: 0,
        cameFrom: undefined as any,
        direction: undefined as any
      },
    });
  }

  enqueue(element: PathNode) {
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
    return this.values.map((x) => x.value.id);
  }
}
