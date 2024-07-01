import { useEffect, useMemo, useRef, useState } from "react";
import { getRandomMap, getRandomSpot } from "../../utils/random";
import { Kind } from "../../utils/contants";

import "./map.css";
import { NodeId, Search, search } from "../../algos/breadthFirst";
import { parseId } from "../../utils/utils";

export type Map = Kind[][];

export function Map({ x = 20, y = 20 }: { x: number; y: number }) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const [map, setMap] = useState(getRandomMap(x, y));

  function addColumn() {
    const newMap = map.map((row) => {
      row.push(getRandomSpot());
      return row;
    });

    setMap(newMap);
  }

  function addRow() {
    const numberOfColumns = map[0].length;
    const newRow = new Array(numberOfColumns).fill(0).map(() => getRandomSpot());

    setMap([...map, newRow]);
  }

  function reset() {
    setStartTile(null);
    setFinishTile(null);
    setStep(0);
    setFrontier([]);
    setReached([]);
    currentSearch.current = undefined;
  }

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

  console.log("Render", map);

  const [startTile, setStartTile] = useState<string | null>(null);
  const [finishTile, setFinishTile] = useState<string | null>(null);

  function handleClick(event: any) {
    const selectedTile = event.target.closest("div") as HTMLDivElement;
    const nodeId = selectedTile.id as any;

    if (!nodeId) {
      return;
    }

    const [x, y] = parseId(nodeId);

    const node = map[y][x];

    // Toggle wall / empty
    if (shiftPressed) {
      const updatedMap = [...map];
      const currentKind = updatedMap[y][x];

      if (currentKind === Kind.Wall) {
        updatedMap[y][x] = Kind.Empty;
        setMap(updatedMap);
      } else if (currentKind === Kind.Empty) {
        updatedMap[y][x] = Kind.Wall;
        setMap(updatedMap);
      } else {
      }
      return;
    }

    // Set start / finish

    if (node === undefined || node === Kind.Wall) {
      return;
    }

    if (nodeId == startTile || nodeId == finishTile) {
      return;
    }

    if (!startTile) {
      setStartTile(selectedTile.id);
    } else if (!finishTile) {
      setFinishTile(selectedTile.id);
    }
  }

  const numberOfColumns = useMemo(() => map[0].length, [map]);
  const numberOfRows = useMemo(() => map.length, [map]);

  const [shiftPressed, setShiftPressed] = useState(false);
  function trackShiftPressed(e: KeyboardEvent, newValue: boolean) {
    if (e.key === "Shift") {
      setShiftPressed(newValue);
      console.log(newValue);
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

    return () => removeShiftPressed();
    // return () => document.removeEventListener("keydown", toggleNodeHandler);
  }, []);

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
      <button className="button" onClick={addColumn}>
        Add colum
      </button>

      <button className="button" onClick={addRow}>
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
        ref={mapRef}
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
