
import { Kind, MapValues, NodeId, Search } from "../shared";
import { formatId } from "../utils/utils";

export function* search(map: MapValues, startNode: NodeId, targetNode: NodeId): Search {
  // Next to visit nodes
  const frontier: NodeId[] = [startNode];
  // List of visited nodes
  const reached = new Set<NodeId>();

  let step = 0;

  while (frontier.length !== 0) {
    const currentNode = frontier.shift()!;

    for (const neighbor of getNeighbors(map, currentNode)) {
      if (!reached.has(neighbor)) {
        frontier.push(neighbor);
        reached.add(neighbor);
      }
    }
    step++;
    yield { step, frontier, reached: [...reached] };
  }
}

function getNeighbors(map: MapValues, node: NodeId): NodeId[] {
  const [x, y] = node.split("-").map(Number);

  const maxX = map[0].length - 1;
  const maxY = map.length - 1;

  
  function isValid(candidate: [x: number, y: number]) {
    const [_x, _y] = candidate

    if ((_x < 0 || _x > maxX || _y < 0 || _y > maxY)) {
      return false
    }

    if (map[_y][_x] === Kind.Wall) {
      return false
    } else {
      return true
    }
  }

  

  const up: [number, number] = [x, y - 1]
  const down: [number, number] = [x, y + 1]
  const left: [number, number] = [x - 1, y]
  const right: [number, number] = [x + 1, y]

  const neighborsCoords = [up, down, left, right]

  if (isValid(left) && isValid(up)) {
    neighborsCoords.push([x - 1, y - 1])
  }

  if (isValid(right) && isValid(up)) {
    neighborsCoords.push([x + 1, y - 1])
  }

  if (isValid(left) && isValid(down)) {
    neighborsCoords.push([x - 1, y + 1])
  }

  if (isValid(right) && isValid(down)) {
    neighborsCoords.push([x + 1, y + 1])
  }



  // const neighborsCoords = [
  //   [x, y - 1], // up
  //   [x, y + 1], // down
  //   [x - 1, y], // left
  //   [x + 1, y], // right
   
  // ];

  // if (neighborsCoords[0])

  // [x - 1, y - 1], // upLeft
  // [x + 1, y - 1], // upRight
  // [x - 1, y + 1], // downLeft
  // [x + 1, y + 1], // downRight

  const result: NodeId[] = [];



  for (const coords of neighborsCoords) {
    const [x, y] = coords as any;
    console.log(x, y, document.getElementById(formatId(x, y)));

    if (x < 0 || x > maxX || y < 0 || y > maxY) {
      continue;
    }

    if (map[y] == undefined || map[y][x] == undefined) {
      debugger
      break
    }

    const node = map[y][x];

    if (node === undefined || node === Kind.Wall) {
      continue;
    }

    result.push(`${x}-${y}`);
  }

  return result;
}
