import { beforeEach, describe, expect, it, vi } from "vitest";

import { SimpleCommandExecutor } from "../../src/core";

vi.mock("../utils/error", () => ({
  getErrorWithFallback: vi.fn((error) =>
    error instanceof Error ? error : new Error("An error occurred"),
  ),
}));

describe("SimpleCommandExecutor", () => {
  let executor: SimpleCommandExecutor;

  beforeEach(() => {
    executor = new SimpleCommandExecutor();
  });

  it('should emit "command:executing" before executing a command', () => {
    const command = { context: {}, execute: vi.fn() };
    const spy = vi.fn();

    executor.emitter.on("command:executing", spy);

    executor.execute(command);

    expect(spy).toHaveBeenCalledWith({ command });
  });

  it("should execute the command", () => {
    const command = { context: {}, execute: vi.fn() };

    executor.execute(command);

    expect(command.execute).toHaveBeenCalled();
  });

  it('should emit "command:succeeded" if the command executes successfully', () => {
    const command = { context: {}, execute: vi.fn() };
    const spy = vi.fn();

    executor.emitter.on("command:succeeded", spy);

    executor.execute(command);

    expect(spy).toHaveBeenCalledWith({ command });
  });

  it('should emit "command:failed" if the command throws an error', () => {
    const error = new Error("Test error");
    const command = {
      context: {},
      execute: vi.fn(() => {
        throw error;
      }),
    };
    const spy = vi.fn();

    executor.emitter.on("command:failed", spy);

    executor.execute(command);

    expect(spy).toHaveBeenCalledWith({
      command,
      error: expect.any(Error),
    });
  });

  it('should emit "command:executed" after a command is executed', () => {
    const command = { context: {}, execute: vi.fn() };
    const spy = vi.fn();

    executor.emitter.on("command:executed", spy);

    executor.execute(command);

    expect(spy).toHaveBeenCalledWith({ command });
  });

  it('should emit "command:executed" even if the command fails', () => {
    const command = {
      context: {},
      execute: vi.fn(() => {
        throw new Error("Test error");
      }),
    };
    const spy = vi.fn();

    executor.emitter.on("command:executed", spy);

    executor.execute(command);

    expect(spy).toHaveBeenCalledWith({ command });
  });
});
