import { useState } from "react";

import { HistoryCommandExecutor } from "./core/history-command-executor.ts";
import { useHistory } from "./react/useHistorySelector.ts";

const commandExecutor = new HistoryCommandExecutor<{ count: number }>({
  maxHistoryLength: 10,
});

function IncrementCommand(count: number, setCount: (count: number) => void) {
  return {
    context: {
      count: count + 1,
    },
    execute: () => {
      setCount(count + 1);
    },
    undo: () => {
      setCount(count);
    },
  };
}

function DecrementCommand(count: number, setCount: (count: number) => void) {
  return {
    context: {
      count: count - 1,
    },
    execute: () => {
      setCount(count - 1);
    },
    undo: () => {
      setCount(count);
    },
  };
}

function App() {
  const { canRedo, canUndo, history, cursor } = useHistory(
    commandExecutor.history,
  );

  const [count, setCount] = useState(0);

  const onIncrement = () => {
    commandExecutor.execute(IncrementCommand(count, setCount));
  };

  const onDecrement = () => {
    commandExecutor.execute(DecrementCommand(count, setCount));
  };

  return (
    <div>
      <button onClick={() => commandExecutor.undo()} disabled={!canUndo}>
        Undo
      </button>
      <button onClick={() => commandExecutor.redo()} disabled={!canRedo}>
        Redo
      </button>

      <div>
        <button onClick={onIncrement}>Increment</button>
        <button onClick={onDecrement}>Decrement</button>
        <span>{count}</span>
      </div>

      <div>
        <h2>History</h2>
        <ul>
          {history.map((command, index) => (
            <li
              key={index}
              style={{
                color: index === cursor ? "red" : "black",
              }}
            >
              {command.context.count}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
