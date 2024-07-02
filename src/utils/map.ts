import { Kind } from "../shared";
import { getRandomMap, getRandomSpot } from "./random";

export class Map {
  values: Kind[][];
  constructor(x: number, y: number) {
    this.values = getRandomMap(x, y);
  }

  get maxX() {
    return this.values.length;
  }

  get maxY() {
    return this.values[0].length;
  }

  at(x: number, y: number) {
    if (!this.#validCoords(x, y)) {
      throw new Error(`Invalid coords x: ${x} y: ${y}`);
    }

    const node = this.values[y][x];

    return node;
  }

  addColum() {
    const newMap = this.values.map((x) => {
      x.push(getRandomSpot());
      return x;
    });

    return (this.values = newMap);
  }

  addRow() {
    const numberOfColumns = this.values[0].length;
    const newRow = new Array(numberOfColumns).fill(0).map(() => getRandomSpot());

    return (this.values = [...this.values, newRow]);
  }

  toogleNode(x: number, y: number) {
    if (!this.#validCoords(x, y)) {
      throw new Error(`Invalid coords x: ${x} y: ${y}`);
    }

    const newMap = [...this.values];
    const currentKind = this.at(x, y);

    if (currentKind === Kind.Empty) {
      newMap[y][x] = Kind.Wall;
    } else {
      newMap[y][x] = Kind.Empty;
    }

    return newMap;
  }

  #validCoords(x: number, y: number) {
    return this.#validX(x) && this.#validY(y);
  }

  #validX(x: number) {
    return x >= 0 && x <= this.maxX;
  }

  #validY(y: number) {
    return y >= 0 && y <= this.maxY;
  }
}
