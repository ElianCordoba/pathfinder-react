import { Kind, PERCENTAGE_OF_WALLS } from "./contants"

export function getRandomMap(rows: number, cols: number, percentageOfWalls = PERCENTAGE_OF_WALLS) {
  const map = Array.from({ length: rows }, () => Array.from({ length: cols}, () => getRandomSpot(percentageOfWalls)))
  return map
}

export function getRandomSpot(percentageOfWalls = PERCENTAGE_OF_WALLS) {
  return Math.random() * 100 > percentageOfWalls ? Kind.Empty : Kind.Wall
}