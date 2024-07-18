import { useAppState } from "../../state";

import "./MapControls.css";

export function MapControls() {
  const { addColumn, addRow, clearMap, randomizeMap } = useAppState();

  return (
    <div className="controls-layout map-controls">
      <button className="button" onClick={addColumn}>
        Add column
      </button>

      <button className="button" onClick={addRow}>
        Add row
      </button>

      <button className="button" onClick={clearMap}>
        Clear map
      </button>

      <button className="button" onClick={randomizeMap}>
        Randomize map
      </button>
    </div>
  );
}
