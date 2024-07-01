import { Kind, PERCENTAGE_OF_WALLS } from "./contants"
import { Map } from '../components/map/map'

export function getRandomMap(x: number,y: number,  percentageOfWalls = PERCENTAGE_OF_WALLS): Map {
  const map = Array.from({ length: y }, () => Array.from({ length: x}, () => getRandomSpot(percentageOfWalls)))
  return map
}

export function getRandomSpot(percentageOfWalls = PERCENTAGE_OF_WALLS) {
  return Math.random() * 100 > percentageOfWalls ? Kind.Empty : Kind.Wall
}