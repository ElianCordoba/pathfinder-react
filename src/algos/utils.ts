import { Direction, MapValues, NodeId, Kind, Reached, PathNode } from "../shared";
import { assert, oppositeDirection, parseId } from "../utils/utils";

export interface NeighborNode {
  direction: Direction;
  id: [x: number, y: number];
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

export function reconstructPath(startNode: NodeId, targetNode: NodeId, reached: Reached) {
  const start: Partial<PathNode> = { id: startNode }
  const target: Partial<PathNode> = { id: targetNode, cameFrom: targetNode }

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
  return path.reverse().map(x => ({ ...x, direction: oppositeDirection(x.direction!) }))
}

export function getCost(a: NodeId, b: NodeId, isDiagonal: boolean) {
  const aCoords = parseId(a)
  const bCoords = parseId(b)
  
   // Manhattan distance on a square grid
   const res = Math.abs(aCoords[0] - bCoords[0]) + Math.abs(aCoords[1] - bCoords[1])

   if (isDiagonal) {
    return res / 2
   } else {
    return res
   }

}