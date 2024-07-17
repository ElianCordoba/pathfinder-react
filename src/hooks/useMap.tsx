import { useRef, useState } from "react";

import { Map } from "../utils/map";
import { MapControls, MapValues } from "../shared";

// Wraps the Map class to sync the state with the component
export function useMap(initialXSize: number, initialYSize: number) {
  let realMap = useRef(new Map(initialXSize, initialYSize));

  const [map, setMap] = useState<MapValues>(realMap.current.values);

  const mapControls: MapControls = {
    addColumn: () => setMap(realMap.current.addColum()),
    addRow: () => setMap(realMap.current.addRow()),
    toggleNode: (x: number, y: number) => setMap(realMap.current.toogleNode(x, y)),
    clearMap: () => {
      realMap.current = new Map(realMap.current.maxX, realMap.current.maxY, 0);
      setMap(realMap.current.values);
    },
    randomizeMap: () => {
      realMap.current = new Map(realMap.current.maxX, realMap.current.maxY);
      setMap(realMap.current.values);
    },
    realMap: realMap.current,
  };

  return [map, mapControls] as const;
}
