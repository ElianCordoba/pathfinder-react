import { useRef, useState } from "react";

import { Map } from "../utils/map";

export function useMap(initialXSize: number, initialYSize: number) {
  const realMap = useRef(new Map(initialXSize, initialYSize));

  const [map, setMap] = useState(realMap.current.values);

  const mapControls = {
    addColumn: () => setMap(realMap.current.addColum()),
    addRow: () => setMap(realMap.current.addRow()),
    toggleNode: (x: number, y: number) => setMap(realMap.current.toogleNode(x, y)),
    realMap,
  };

  return [map, mapControls] as const;
}
