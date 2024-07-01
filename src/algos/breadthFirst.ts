/*
frontier = [start]
reached = new Set()

while frontier.length != 0 {
  current = frontienr.pop()

  for neighbor in = get_neighbors
    if !reached.has(neibour)
      frontier.push(neibour)
      frontier.add(neibour)


}

*/

/* 
  Map format:

  [  
    [1, 0, 0, 1, 0],
    [0, 1, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 0, 0, 0],
  ]

  Ids:

  [
    [ 0-0, 0-1, 0-2, 0-3, 0-4],
    [ 1-0, 1-1, 1-2, 1-3, 1-4],
    [ 2-0, 2-1, 2-2, 2-3, 2-4],
    [ 3-0, 3-1, 3-2, 3-3, 3-4],
  ]

  NodeId = x-y
*/

import { Map } from "../components/map/map";
import { Kind } from "../utils/contants";
import { formatId } from "../utils/utils";

export type NodeId = `${number}-${number}`;

export type Search = Generator<{ step: number; frontier: NodeId[]; reached: NodeId[] }, void, unknown>;

export function* search(map: Map, startNode: NodeId, targetNode: NodeId): Search {
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

function getNeighbors(map: Map, node: NodeId): NodeId[] {
  const [x, y] = node.split("-").map(Number);

  const maxX = map[0].length - 1;
  const maxY = map.length - 1;

  // Bound check
  function isValid(candidate: [x: number, y: number]) {
    const [_x, _y] = candidate
    return !(_x < 0 || _x > maxX || _y < 0 || _y > maxY)
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

function isNodeValid(map: Map, x: number, y: number) {

}
