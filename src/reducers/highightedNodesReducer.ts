import { NodeId } from "../shared";

export enum HighlighterAction {
  ShowHighlight,
  RemoveHighlight,
}

export interface HighlighterState {
  currentNode: NodeId;
  cameFromNode: NodeId;
}

type ActionType<Type extends HighlighterAction> = {
  type: Type;
  payload: PayloadActionMapper[Type];
};

type PayloadActionMapper = {
  [HighlighterAction.ShowHighlight]: {
    highlightedNode: NodeId;
  };
  [HighlighterAction.RemoveHighlight]: "";
};

export function highlighterReducer<Type extends HighlighterAction>(state: HighlighterState, action: any) {
  switch (action.type) {
    case HighlighterAction.ShowHighlight:
      return {
        ...state,
        currentNode: action.currentNode,
        cameFromNode: action.cameFromNode,
      };
    case HighlighterAction.RemoveHighlight: {
      return {
        ...state,
        currentNode: "",
        cameFromNode: "",
      };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}
