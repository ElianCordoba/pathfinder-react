import { useMemo } from "react";

import { Direction, Kind, MapValues, NodeId, PathSegment, VisitedNode } from "../../shared";

import Arrow from "../../assets/arrow.svg";
import "./MapViewer.css";
import { HighlighterState } from "../../reducers/highightedNodesReducer";

const CELL_SIZE = 30;
export function MapViewer({
  map,
  onNodeClick,
  startNode,
  finishNode,
  nodesToVisit,
  nodesVisited,
  path,
  highlightingState,
}: {
  map: MapValues;
  onNodeClick: (nodeId: NodeId) => void;
  startNode: NodeId | null;
  finishNode: NodeId | null;
  nodesToVisit: PathSegment[];
  nodesVisited: VisitedNode;
  path: PathSegment[];
  highlightingState: HighlighterState;
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

  function getNodeClasses(node: Kind, id: NodeId) {
    let classes = "spot";

    if (node == Kind.Empty) {
      classes += " empty";
    } else if (node == Kind.Wall) {
      classes += " wall";
    }

    if (id === highlightingState.currentNode) {
      classes += " highlight-current";
    } else if (id === highlightingState.cameFromNode) {
      classes += " highlight-came-from";
    }

    if (id == startNode) {
      classes += " start";
    } else if (id == finishNode) {
      classes += " finish";
    } else if (path?.find((p) => p.id === id)) {
      classes += " path";
    } else if (nodesToVisit.find((f) => f.id === id)) {
      classes += " frontier";
    } else if (nodesVisited.has(id)) {
      classes += " reached";
    }

    return classes;
  }

  function getArrowRotation(direction: Direction) {
    switch (direction) {
      case Direction.Up:
        return 0;
      case Direction.UpRight:
        return 45;
      case Direction.Right:
        return 90;
      case Direction.DownRight:
        return 135;
      case Direction.Down:
        return 180;
      case Direction.DownLeft:
        return 225;
      case Direction.Left:
        return 270;
      case Direction.UpLeft:
        return 315;
    }
  }

  const _map = useMemo(() => map, [map, path]);

  return (
    <div
      className="map-container"
      style={{
        margin: "50px auto",
        gridTemplateColumns: `repeat(${numberOfColumns}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${numberOfRows}, ${CELL_SIZE}px)`,
      }}
      onClick={handleClick}
    >
      {_map.map((x, xIndex) => {
        return x.map((y, yIndex) => {
          const id = `${yIndex}-${xIndex}` as NodeId;

          const visitedNode = nodesVisited.get(id);
          const toVisitNode = nodesToVisit.find((f) => f.id === id);

          const cost = visitedNode?.fCost || toVisitNode?.fCost || undefined;

          const styles =
            visitedNode && visitedNode.direction
              ? { transform: `rotate(${getArrowRotation(visitedNode.direction!)}deg)` }
              : {};

          return (
            <div id={id} key={id} className={getNodeClasses(y, id)}>
              {cost && <div>{cost}</div>}
              {visitedNode && <img className={"arrow"} style={styles} src={Arrow} alt="" />}
            </div>
          );
        });
      })}
    </div>
  );
}
