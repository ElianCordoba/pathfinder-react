import { useRef, useState } from "react";
import "./App.css";

import { MapViewer } from "./components/MapViewer/MapViewer";
import { Controls } from "./components/controls/Controls";

import { useIsKeyPressed } from "./hooks/useIsKeyPressed";
import { useMap } from "./hooks/useMap";
import { usePathfinder } from "./hooks/usePathfinder";

import { parseId } from "./utils/utils";
import { Kind, NodeId } from "./shared";
// import { search as BF } from "./algos/breadthFirst";
// import { search as x } from "./algos/dijkstra";
import { search } from "./algos/dijkstra2";

function App() {
  const [startNode, setStartTile] = useState<NodeId | null>(null);
  const [finishNode, setFinishTile] = useState<NodeId | null>(null);

  const [map, mapControls] = useMap(3, 3);

  const { step, nodesToVisit, nodesVisited, path, nextStep, resetSearch } = usePathfinder(
    search,
    map,
    startNode,
    finishNode
  );

  const [isShiftPressed] = useIsKeyPressed("Shift");

  // Event handlers

  function onNodeClick(nodeId: NodeId) {
    const [x, y] = parseId(nodeId);

    if (isShiftPressed) {
      // Toggle wall / empty
      mapControls.toggleNode(x, y);
    } else {
      // Set start / finish nodes
      const node = mapControls.realMap.at(x, y);

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
    clearInterval(intervalId.current);
  }

  const intervalId = useRef(0);
  function automaticSeach() {
    intervalId.current = setInterval(() => {
      nextStep();
    }, 100);
  }

  return (
    <>
      <Controls
        addColumnHandler={mapControls.addColumn}
        addRowHandler={mapControls.addRow}
        clearMapHandler={mapControls.clearMap}
        resetHandler={reset}
        nextStepHandler={nextStep}
        automaticSeachHandler={automaticSeach}
      />
      <h1>Step: {step}</h1>
      <MapViewer
        map={map}
        onNodeClick={onNodeClick}
        startNode={startNode}
        finishNode={finishNode}
        nodesToVisit={nodesToVisit}
        nodesVisited={nodesVisited}
        path={path}
      />
    </>
  );
}

export default App;
