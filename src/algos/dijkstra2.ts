import { Direction, Kind, MapValues, NodeId, PathfinderSearch, PathNode } from "../shared";
import { assert, formatId, parseId } from "../utils/utils";
import { PriorityQueue } from "./dijkstra";
import { getCost } from "./utils";

interface VisitedNode {
  // Current node ID
  id: NodeId;
  // Where did we came from to reach this node
  cameFrom: NodeId;
  // Direction taken from the last node to get here
  directionTaken: Direction;
  // Total cost from the given path taken to here
  costSoFar: number;
}

export function* search(map: MapValues, startNode: NodeId, targetNode: NodeId): PathfinderSearch {
  const nodesToVisit = new PriorityQueue(startNode)
  const visitedNodes: Map<NodeId, VisitedNode> = new Map()

  mainLoop: while (!nodesToVisit.isEmpty()) {
    const currentNode = nodesToVisit.dequeue();

    // Early exit
    if (currentNode.value.id === targetNode) {
      break mainLoop
    }

    const neighbors = getNeighbors(map, currentNode.value.id)
    
    for (const neighbor of neighbors) {
      const neighborId = formatId(...neighbor.id)
      const constToVisitNeibour = getCost(currentNode.value.id, neighborId, neighbor.direction > Direction.Right)
      const wasNodeVisited = visitedNodes.get(neighborId)

      if (constToVisitNeibour < (wasNodeVisited?.costSoFar || 0)) {
        debugger
      }
      
      if (!wasNodeVisited || constToVisitNeibour < wasNodeVisited.costSoFar) { // || constToVisitNeibour < (wasNodeVisited.costSoFar || 0)
        // const costSoFar = (visitedNodes.get(currentNode.value.id)?.costSoFar || 0) + constToVisitNeibour
        let costSoFar = currentNode.value.cost + constToVisitNeibour

        // if (!wasNodeVisited) {
        //   costSoFar = currentNode.value.cost + constToVisitNeibour
        // } else {
        //   costSoFar = currentNode.value.cost
        // }

        visitedNodes.set(neighborId, {
          id: neighborId,
          cameFrom: currentNode.value.id,
          costSoFar,
          directionTaken: neighbor.direction
        })

        nodesToVisit.enqueue({
          id: neighborId,
          cost: constToVisitNeibour,
          cameFrom: currentNode.value.id,
          direction: currentNode.value.direction,
        })
      }
    }

    yield { frontier: nodesToVisit.toArray(), reached: visitedNodes, step: 0 }
  }

  return { path: visitedNodes.size ? reconstructPath(startNode, targetNode, visitedNodes) : undefined }
}

export function reconstructPath(startNode: NodeId, targetNode: NodeId, visitedNodes: Map<NodeId, VisitedNode>) {
  const start: Partial<VisitedNode> = { id: startNode, costSoFar: 0 }
  const target: Partial<VisitedNode> = { id: targetNode, cameFrom: targetNode }

  let current = target
  const path: VisitedNode[] = []

  while (current.id !== start.id) {
    current = visitedNodes.get(current.cameFrom!)!

    if (!current) {
      break
    }

    path.push(current as VisitedNode)
  }

  path.push(start as VisitedNode)
  return path.reverse()//.map(x => ({ ...x, direction: oppositeDirection(x.direction!) }))
}

interface NeighborNode {
  direction: Direction;
  id: [x: number, y: number];
  // cost: number
}

export function getNeighbors(map: MapValues, node: NodeId): NeighborNode[] {
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

  const neighborsCoords: NeighborNode[] = [up, right, down, left];

  if (isValid(up) || isValid(right)) {
    neighborsCoords.push({ direction: Direction.UpRight, id: [x + 1, y - 1] });
  }

  if (isValid(down) || isValid(right)) {
    neighborsCoords.push({ direction: Direction.DownRight, id: [x + 1, y + 1] });
  }  

  if (isValid(down) || isValid(left)) {
    neighborsCoords.push({ direction: Direction.DownLeft, id: [x - 1, y + 1] });
  }

  if (isValid(up) || isValid(left)) {
    neighborsCoords.push({ direction: Direction.UpLeft, id: [x - 1, y - 1] });
  }

  const result: NeighborNode[] = [];

  for (const neighbor of neighborsCoords) {
    const [x, y] = neighbor.id;
    // console.log(x, y, document.getElementById(formatId(x, y)));

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

  return result;
}