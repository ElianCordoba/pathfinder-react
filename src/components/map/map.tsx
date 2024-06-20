import { useEffect, useMemo, useState } from "react";
import { getRandomMap, getRandomSpot } from "../../utils/random";
import { Kind } from "../../utils/contants";

import "./map.css";

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

  console.log("Render", map);

  const numberOfColumns = useMemo(() => map[0].length, [map]);
  const numberOfRows = useMemo(() => map.length, [map]);

  useEffect(() => {
    console.log(`Changes: Columns: ${numberOfColumns} Rows: ${numberOfRows}`);
  }, [numberOfColumns, numberOfRows]);

  return (
    <>
      <button className="button" onClick={addColumn}>
        Add colum
      </button>
      <button className="button" onClick={addRow}>
        Add row
      </button>

      <div
        className="map-container"
        style={{
          gridTemplateColumns: `repeat(${numberOfColumns}, 30px)`,
          gridTemplateRows: `repeat(${numberOfRows}, 30px)`,
        }}
      >
        {map.map((row, rowNum) => {
          return row.map((col, colNum) => {
            return <div className={`spot ${col == Kind.Empty ? "empty" : "wall"}`}></div>;
          });
        })}
      </div>
    </>
  );
}
