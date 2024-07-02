import { useEffect, useMemo, useRef, useState } from "react";
import { Kind } from "../../utils/contants";

import "./map.css";
import { NodeId, Search, search } from "../../algos/breadthFirst";
import { parseId } from "../../utils/utils";
import { useMap } from "../../hooks/useMap";

export function MapViewer({ x = 20, y = 20 }: { x: number; y: number }) {
  const [map, mapControls] = useMap(x, y);

  const [step, setStep] = useState(0);
  const [frontier, setFrontier] = useState<NodeId[]>([]);
  const [reached, setReached] = useState<NodeId[]>([]);

  let currentSearch = useRef<Search>();
  function nextStep() {
    if (!startTile || !finishTile) {
      console.log("Refused to start calculation as start and / or finish nodes are not set");
      return;
    }

    if (!currentSearch.current) {
      currentSearch.current = search(map, startTile as any, finishTile as any);
    }

    const nextStep = currentSearch.current.next();

    if (nextStep.done) {
      console.log("Search done");
      return;
    }

    const { step, frontier, reached } = nextStep.value;

    setStep(step);
    setFrontier(frontier);
    setReached(reached);
  }

  const [startTile, setStartTile] = useState<string | null>(null);
  const [finishTile, setFinishTile] = useState<string | null>(null);

  function handleClick(event: any) {
    const selectedTile = event.target.closest("div") as HTMLDivElement;
    const nodeId = selectedTile.id as any;

    if (!nodeId) {
      return;
    }

    const [x, y] = parseId(nodeId);

    if (shiftPressed) {
      // Toggle wall / empty
      mapControls.toggleNode(x, y);
    } else {
      // Set start / finish
      const node = mapControls.realMap.peek(x, y);

      if (node === Kind.Wall || nodeId == startTile || nodeId == finishTile) {
        return;
      }

      if (!startTile) {
        setStartTile(selectedTile.id);
      } else if (!finishTile) {
        setFinishTile(selectedTile.id);
      }
    }
  }

  function reset() {
    setStartTile(null);
    setFinishTile(null);
    setStep(0);
    setFrontier([]);
    setReached([]);
    currentSearch.current = undefined;
  }

  const [shiftPressed, setShiftPressed] = useState(false);
  function trackShiftPressed(e: KeyboardEvent, newValue: boolean) {
    if (e.key === "Shift") {
      setShiftPressed(newValue);
    }
  }

  function listenShiftPressed() {
    document.addEventListener("keydown", (e) => trackShiftPressed(e, true));
    document.addEventListener("keyup", (e) => trackShiftPressed(e, false));
  }

  function removeShiftPressed() {
    document.removeEventListener("keydown", (e) => trackShiftPressed(e, true));
    document.removeEventListener("keyup", (e) => trackShiftPressed(e, false));
  }

  useEffect(() => {
    listenShiftPressed();
    return removeShiftPressed;
  }, []);

  const numberOfColumns = useMemo(() => map[0].length, [map]);
  const numberOfRows = useMemo(() => map.length, [map]);
  // useEffect(() => {
  //   console.log(`Changes: Columns: ${numberOfColumns} Rows: ${numberOfRows}`);
  // }, [numberOfColumns, numberOfRows]);

  function getNodeClasses(node: number, id: string) {
    let classes = "spot";

    if (node == Kind.Empty) {
      classes += " empty";
    } else if (node == Kind.Wall) {
      classes += " wall";
    }

    if (id == startTile) {
      classes += " start";
    } else if (id == finishTile) {
      classes += " finish";
    } else if (frontier.find((f) => f === id)) {
      classes += " frontier";
    } else if (reached.find((r) => r === id)) {
      classes += " reached";
    }

    return classes;
  }

  return (
    <>
      <button className="button" onClick={mapControls.addColumn}>
        Add column
      </button>

      <button className="button" onClick={mapControls.addRow}>
        Add row
      </button>

      <button className="button" onClick={reset}>
        Reset
      </button>

      <button className="button" onClick={nextStep}>
        Next step
      </button>

      <h1>
        Current step {step} | Frontier {frontier.length} | Reached {reached.length}
      </h1>

      <h1>Shift pressed? {shiftPressed ? "1" : "0"}</h1>

      <div
        className="map-container"
        style={{
          gridTemplateColumns: `repeat(${numberOfColumns}, 30px)`,
          gridTemplateRows: `repeat(${numberOfRows}, 30px)`,
        }}
        onClick={handleClick}
      >
        {map.map((x, xIndex) => {
          return x.map((y, yIndex) => {
            const id = `${yIndex}-${xIndex}`;
            return <div id={id} key={id} className={getNodeClasses(y, id)}></div>;
          });
        })}
      </div>
    </>
  );
}
