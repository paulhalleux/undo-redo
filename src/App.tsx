import { useState } from "react";

import { useHistory } from "./react/useHistorySelector.ts";
import { HistoryCommandExecutor } from "./core";

type CommandContext = {
  type: "init" | "increment" | "decrement";
  count: number;
};

const commandExecutor = new HistoryCommandExecutor<CommandContext>({
  historyManagerOptions: {
    maxHistoryLength: 10,
    initialState: InitCounterCommand(0),
  },
});

type Counter = {
  count: number;
  increment: () => void;
  decrement: () => void;
  setCount: (count: number) => void;
};

function useCounter(): Counter {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);

  return {
    count,
    increment,
    decrement,
    setCount,
  };
}

function InitCounterCommand(initialCount: number) {
  return {
    context: {
      type: "init" as const,
      count: initialCount,
    },
    execute: () => {},
    undo: () => {},
  };
}

function IncrementCommand(counter: Counter) {
  return {
    context: {
      type: "increment" as const,
      count: counter.count + 1,
    },
    execute: () => {
      counter.increment();
    },
    undo: () => {
      counter.setCount(counter.count);
    },
  };
}

function DecrementCommand(counter: Counter) {
  return {
    context: {
      type: "decrement" as const,
      count: counter.count - 1,
    },
    execute: () => {
      counter.decrement();
    },
    undo: () => {
      counter.setCount(counter.count);
    },
  };
}

function App() {
  const history = useHistory(commandExecutor.history);
  const counter = useCounter();

  const onIncrement = () => commandExecutor.execute(IncrementCommand(counter));
  const onDecrement = () => commandExecutor.execute(DecrementCommand(counter));

  return (
    <div>
      <button onClick={commandExecutor.undo} disabled={!history.canUndo}>
        Undo
      </button>
      <button onClick={commandExecutor.redo} disabled={!history.canRedo}>
        Redo
      </button>
      <button onClick={history.clear}>Clear</button>

      <div>
        <button onClick={onIncrement}>Increment</button>
        <button onClick={onDecrement}>Decrement</button>
        <span>{counter.count}</span>
      </div>

      <div>
        <h2>History</h2>
        <ul>
          {history.history.map((command, index) => (
            <li
              key={index}
              style={{
                color: index === history.cursor ? "red" : "black",
              }}
            >
              {command.context.type}: {command.context.count}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
