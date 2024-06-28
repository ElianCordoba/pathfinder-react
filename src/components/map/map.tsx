import { useEffect, useMemo, useState } from "react";
import { getRandomMap, getRandomSpot } from "../../utils/random";
import { Kind } from "../../utils/contants";

import "./map.css";

export type Map = Kind[][];

export function Map({ rows = 20, cols = 20 }: { rows: number; cols: number }) {
  const [map, setMap] = useState(getRandomMap(rows, cols));

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
  }

  console.log("Render", map);

  const [startTile, setStartTile] = useState<string | null>(null);
  const [finishTile, setFinishTile] = useState<string | null>(null);

  function handleClick(x: any) {
    const selectedTile = x.target.closest("div") as HTMLDivElement;
    debugger;
    // Not a tile
    if (!selectedTile.className.includes("spot")) {
      return;
    }

    if (/(wall|start|finish)/.test(selectedTile.className)) {
      return;
    }

    if (!startTile) {
      setStartTile(selectedTile.id);
    } else if (!finishTile) {
      setFinishTile(selectedTile.id);
    }

    // debugger;
  }

  const numberOfColumns = useMemo(() => map[0].length, [map]);
  const numberOfRows = useMemo(() => map.length, [map]);

  useEffect(() => {
    console.log(`Changes: Columns: ${numberOfColumns} Rows: ${numberOfRows}`);
  }, [numberOfColumns, numberOfRows]);

  function getNodeClasses(col: number, id: string) {
    let classes = "spot";

    if (col == Kind.Empty) {
      classes += " empty";
    } else {
      classes += " wall";
    }

    if (id == startTile) {
      classes += " start";
    } else if (id == finishTile) {
      classes += " finish";
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

      <div
        className="map-container"
        style={{
          gridTemplateColumns: `repeat(${numberOfColumns}, 30px)`,
          gridTemplateRows: `repeat(${numberOfRows}, 30px)`,
        }}
        onClick={handleClick}
      >
        {map.map((row, rowNum) => {
          return row.map((col, colNum) => {
            const id = `${rowNum}-${colNum}`;
            return <div id={id} key={id} className={getNodeClasses(col, id)}></div>;
          });
        })}
      </div>
    </>
  );
}
