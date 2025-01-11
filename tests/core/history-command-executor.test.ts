import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  Command,
  HistoryCommandExecutor,
  UndoableCommand,
} from "../../src/core";

describe("HistoryCommandExecutor", () => {
  let executor: HistoryCommandExecutor;

  beforeEach(() => {
    executor = new HistoryCommandExecutor({ maxHistoryLength: 10 });
  });

  it("should execute a command using the base executor", () => {
    const command: Command = {
      context: {},
      execute: vi.fn(),
    };

    executor.execute(command);

    expect(command.execute).toHaveBeenCalled();
  });

  it("should add undoable commands to history after execution", () => {
    const undoableCommand: UndoableCommand = {
      context: {},
      execute: vi.fn(),
      undo: vi.fn(),
    };

    executor.execute(undoableCommand);

    expect(executor.history.getHistory()).toEqual([undoableCommand]);
  });

  it("should not add non-undoable commands to history", () => {
    const command: Command = {
      context: {},
      execute: vi.fn(),
    };

    executor.execute(command);

    expect(executor.history.getHistory()).toEqual([]);
  });

  it('should undo the last command and emit "command:undo"', () => {
    const undoableCommand: UndoableCommand = {
      context: {},
      execute: vi.fn(),
      undo: vi.fn(),
    };

    executor.execute(undoableCommand);

    const undoSpy = vi.fn();
    executor.emitter.on("command:undo", undoSpy);

    executor.undo();

    expect(undoableCommand.undo).toHaveBeenCalled();
    expect(undoSpy).toHaveBeenCalledWith({ command: undoableCommand });
  });

  it('should not emit "command:undo" if there is no command to undo', () => {
    const undoSpy = vi.fn();
    executor.emitter.on("command:undo", undoSpy);

    executor.undo();

    expect(undoSpy).not.toHaveBeenCalled();
  });

  it('should redo the last command undone and emit "command:redo"', () => {
    const undoableCommand: UndoableCommand = {
      context: {},
      execute: vi.fn(),
      undo: vi.fn(),
    };

    executor.execute(undoableCommand);
    executor.undo();

    const redoSpy = vi.fn();
    executor.emitter.on("command:redo", redoSpy);

    executor.redo();

    expect(undoableCommand.execute).toHaveBeenCalled();
    expect(redoSpy).toHaveBeenCalledWith({ command: undoableCommand });
  });

  it('should not emit "command:redo" if there is no command to redo', () => {
    const redoSpy = vi.fn();
    executor.emitter.on("command:redo", redoSpy);

    executor.redo();

    expect(redoSpy).not.toHaveBeenCalled();
  });

  it("should return the history manager", () => {
    expect(executor.history).toBeDefined();
  });

  it("should check if a command is undoable", () => {
    const undoableCommand: UndoableCommand = {
      context: {},
      execute: vi.fn(),
      undo: vi.fn(),
    };

    const command: Command = {
      context: {},
      execute: vi.fn(),
    };

    // Access the private `isUndoable` method indirectly
    executor.execute(undoableCommand); // Should be added to history
    executor.execute(command); // Should not be added to history

    expect(executor.history.getHistory()).toContain(undoableCommand);
    expect(executor.history.getHistory()).not.toContain(command);
  });
});
