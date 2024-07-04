import { Direction, Kind, MapValues, NodeId, PathNode, Reached, PathfinderSearch } from "../shared";
import { assert, formatId, oppositeDirection } from "../utils/utils";

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
        reached.set(nextNodeId, { id: nextNodeId, cameFrom: currentNode, direction: neighbor.direction });
      }
    }
    step++;
    yield { step, frontier, reached };
  }

  return {
    path: reached.size ? reconstructPath(startNode, targetNode, reached) : undefined
  }  
}

interface NeighborNode {
  direction: Direction;
  id: [x: number, y: number];
}

function getNeighbors(map: MapValues, node: NodeId): NeighborNode[] {
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

  const up: NeighborNode = { direction: Direction.Up, id: [x, y - 1] };
  const down: NeighborNode = { direction: Direction.Down, id: [x, y + 1] };
  const left: NeighborNode = { direction: Direction.Left, id: [x - 1, y] };
  const right: NeighborNode = { direction: Direction.Right, id: [x + 1, y] };

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

function reconstructPath(startNode: NodeId, targetNode: NodeId, reached: Reached) {
  const start: PathNode = { id: startNode }
  const target: PathNode = { id: targetNode, cameFrom: targetNode }

  let current = target
  const path: PathNode[] = []

  while (current.id !== start.id) {
    current = reached.get(current.cameFrom!)!

    if (!current) {
      break
    }

    path.push(current)
  }

  path.push(start)
  // path.shift()
  return path.reverse().map(x => ({ ...x, direction: oppositeDirection(x.direction!) }))
}
