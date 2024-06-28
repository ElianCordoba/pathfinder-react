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

import { Map } from '../components/map/map'
import { Kind } from '../utils/contants'

type NodeId = `${number}-${number}`

export function search(map: Map, startNode: NodeId, targetNode: NodeId) {
  // Next to visit nodes
  const frontier: NodeId[] = [startNode]
  // List of visited nodes
  const reached = new Set<NodeId>()

  while (frontier.length !== 0) {
    const currentNode = frontier.pop()!

    for (const neighbor of getNeighbors(map, currentNode)) {
      if (!reached.has(neighbor)) {
        frontier.push(neighbor)
        frontier.push(neighbor) 
      }
    }
  }
}

function getNeighbors(map: Map, node: NodeId): NodeId[] {
  const [x, y] = node.split('-').map(Number)

  const neighborsCoords = [
    [[  x  ],[y + 1], ], // up
    [[  x  ],[y - 1], ], // down
    [[x - 1],[  y  ], ], // left
    [[x + 1],[  y  ], ], // right
    [[x - 1],[y + 1], ], // upLeft
    [[x + 1],[y + 1], ], // upRight
    [[x - 1],[y - 1], ], // downLeft
    [[x + 1],[y - 1]  ] // downRight
  ]

  const result: NodeId[] = []

  for (const coords of neighborsCoords) {
    const [x, y] = coords as any

    const node = map[x][y]
    
    if (node === undefined || node === Kind.Wall) {
      continue
    }

    result.push(`${x}-${y}`)
  }

  return result
}