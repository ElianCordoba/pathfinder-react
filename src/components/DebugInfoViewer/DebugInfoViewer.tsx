import { HighlighterAction } from "../../reducers/highightedNodesReducer";
import { PathNode, VisitedNode } from "../../shared";

import "./DebugInfoViewer.css";

const dataCellTypes = ["id", "came-from"] as const;

export function DebugInfoViewer({
  nodesToVisit,
  nodesVisited,
  highlightNode,
}: {
  nodesToVisit: PathNode[];
  nodesVisited: VisitedNode[];
  highlightNode: any;
}) {
  nodesVisited;

  function showInfo(nodeToVisit: PathNode) {
    highlightNode({
      type: HighlighterAction.ShowHighlight,
      currentNode: nodeToVisit.id,
      cameFromNode: nodeToVisit.cameFrom,
    });
  }

  function hideInfo() {
    highlightNode({ type: HighlighterAction.RemoveHighlight });
  }

  return (
    <div className="table-container">
      <div className="table" onMouseLeave={() => hideInfo()}>
        <h1>Nodes to visit</h1>
        <table>
          <tr>
            <th className="current">Id</th>
            <th className="came-from">Came from</th>
            <th>Cost</th>
          </tr>
          {nodesToVisit.map((nodeToVisit) => {
            return (
              <tr onMouseEnter={() => showInfo(nodeToVisit)} key={`${nodeToVisit.id}-${nodeToVisit.cameFrom}`}>
                <td>{nodeToVisit.id}</td>
                <td>{nodeToVisit.cameFrom}</td>
                <td>{nodeToVisit.cost}</td>
              </tr>
            );
          })}
        </table>
      </div>
    </div>
  );
}

function validateAndParseHoverableElement(event: any) {
  const element = event.target.closest("td") as HTMLTableCellElement;

  if (!element) {
    return { valid: false };
  }

  const cellType = element.dataset?.type as any;

  if (!dataCellTypes.includes(cellType)) {
    return { valid: false };
  }

  const nodeIdToHoghlight = event.dataset?.nodeId!;

  return {
    valid: true,
    id: nodeIdToHoghlight,
  };
}

// function Hover({ onHover, children }: any) {
//   return (
//     <div className="hover">
//       <div className="hover__no-hover">{children}</div>
//       <div className="hover__hover">{onHover}</div>
//     </div>
//   );
// }
