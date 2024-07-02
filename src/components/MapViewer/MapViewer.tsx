import { useMemo } from "react";

import "./MapViewer.css";
import { Kind, MapValues, NodeId } from "../../shared";

export function MapViewer({
  map,
  onNodeClick,
  startNode,
  finishNode,
  frontier,
  reached,
}: {
  map: MapValues;
  onNodeClick: (nodeId: NodeId) => void;
  startNode: NodeId | null;
  finishNode: NodeId | null;
  frontier: NodeId[];
  reached: NodeId[];
}) {
  function handleClick(event: any) {
    const selectedTile = event.target.closest("div") as HTMLDivElement;
    const nodeId = selectedTile.id as any;

    if (!nodeId) {
      return;
    }

    onNodeClick(nodeId);
  }

  const numberOfColumns = useMemo(() => map[0].length, [map]);
  const numberOfRows = useMemo(() => map.length, [map]);

  function getNodeClasses(node: Kind, id: string) {
    let classes = "spot";

    if (node == Kind.Empty) {
      classes += " empty";
    } else if (node == Kind.Wall) {
      classes += " wall";
    }

    if (id == startNode) {
      classes += " start";
    } else if (id == finishNode) {
      classes += " finish";
    } else if (frontier.find((f) => f === id)) {
      classes += " frontier";
    } else if (reached.find((r) => r === id)) {
      classes += " reached";
    }

    return classes;
  }

  return (
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
  );
}
