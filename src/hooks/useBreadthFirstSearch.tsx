import { useRef, useState } from "react";
import { MapValues, NodeId, Search } from "../shared";
import { search } from "../algos/breadthFirst";

export function useBreadthFirstSearch(map: MapValues, startNode: NodeId | null, finishNode: NodeId | null) {
  const [step, setStep] = useState(0);
  const [frontier, setFrontier] = useState<NodeId[]>([]);
  const [reached, setReached] = useState<NodeId[]>([]);

  let currentSearch = useRef<Search>();
  function nextStep() {
    if (!startNode || !finishNode) {
      console.log("Refused to start calculation as start and / or finish nodes are not set");
      return;
    }

    if (!currentSearch.current) {
      currentSearch.current = search(map, startNode as any, finishNode as any);
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

  function resetSearch() {
    setStep(0);
    setFrontier([]);
    setReached([]);
    currentSearch.current = undefined;
  }

  return [step, frontier, reached, nextStep, resetSearch] as const;
}
