import { useState } from "react";
import "./App.css";

import { MapViewer } from "./components/MapViewer/MapViewer";
import { Controls } from "./components/controls/Controls";

import { useIsKeyPressed } from "./hooks/useIsKeyPressed";
import { useMap } from "./hooks/useMap";
import { useBreadthFirstSearch } from "./hooks/useBreadthFirstSearch";

import { parseId } from "./utils/utils";
import { Kind, NodeId } from "./shared";

function App() {
  const [startNode, setStartTile] = useState<NodeId | null>(null);
  const [finishNode, setFinishTile] = useState<NodeId | null>(null);

  const [map, mapControls] = useMap(3, 3);

  const [step, frontier, reached, nextStep, resetSearch] = useBreadthFirstSearch(map, startNode, finishNode);

  const isShiftPressed = useIsKeyPressed("Shift");

  // Event handlers

  function onNodeClick(nodeId: NodeId) {
    const [x, y] = parseId(nodeId);

    if (isShiftPressed) {
      // Toggle wall / empty
      mapControls.toggleNode(x, y);
    } else {
      // Set start / finish nodes
      const node = mapControls.realMap.peek(x, y);

      if (node === Kind.Wall || nodeId == startNode || nodeId == finishNode) {
        return;
      }

      if (!startNode) {
        setStartTile(nodeId);
      } else if (!finishNode) {
        setFinishTile(nodeId);
      }
    }
  }

  function reset() {
    setStartTile(null);
    setFinishTile(null);
    resetSearch();
  }

  return (
    <>
      <Controls
        addColumnHandler={mapControls.addColumn}
        addRowHandler={mapControls.addRow}
        resetHandler={reset}
        nextStepHandler={nextStep}
      />
      <MapViewer
        map={map}
        onNodeClick={onNodeClick}
        startNode={startNode}
        finishNode={finishNode}
        frontier={frontier}
        reached={reached}
      />
      ;
    </>
  );
}

export default App;
