import "./Controls.css";

export function Controls({
  addColumnHandler,
  addRowHandler,
  resetHandler,
  nextStepHandler,
  automaticSeachHandler,
}: any) {
  return (
    <div className="buttons-container">
      <button className="button" onClick={addColumnHandler}>
        Add column
      </button>

      <button className="button" onClick={addRowHandler}>
        Add row
      </button>

      <button className="button" onClick={resetHandler}>
        Reset
      </button>

      <button className="button" onClick={nextStepHandler}>
        Next step
      </button>

      <button className="button" onClick={automaticSeachHandler}>
        Automatic search
      </button>
    </div>
  );
}
