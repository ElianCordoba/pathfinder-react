import { useState } from "react";

import { Map } from "../utils/map";

export function useMap(initialXSize: number, initialYSize: number) {
  const realMap = new Map(initialXSize, initialYSize);

  const [map, setMap] = useState(realMap.values);

  const mapControls = {
    addColumn: () => setMap(realMap.addColum()),
    addRow: () => setMap(realMap.addRow()),
    toggleNode: (x: number, y: number) => setMap(realMap.toogleNode(x, y)),
    realMap,
  };

  return [map, mapControls] as const;
}
