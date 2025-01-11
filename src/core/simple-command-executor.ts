import { EventEmitter } from "events";

import { getErrorWithFallback } from "../utils/error.ts";

import { Command, CommandExecutor } from "./command.ts";
import { CommandExecutorEmitter } from "./emitter.ts";

/**
 * Simple command executor
 * ---
 * This is a simple implementation of a command executor that executes commands
 * without any additional features. It emits events when a command is being
 * executed, when it succeeds, when it fails, and when it was executed.
 */
export class SimpleCommandExecutor<Context = unknown>
  implements CommandExecutor<Context>
{
  private _emitter: CommandExecutorEmitter<Context>;

  constructor() {
    this._emitter = new EventEmitter();
  }

  /**
   * Execute a command.
   * @param command Command to execute.
   */
  execute(command: Command<Context>): void {
    // Notify that the command is being executed
    this._emitter.emit("command:executing", { command });

    try {
      // Try executing the command
      command.execute();

      // Notify that the command succeeded
      this._emitter.emit("command:succeeded", { command });
    } catch (error) {
      // Notify that the command failed
      this._emitter.emit("command:failed", {
        command,
        error: getErrorWithFallback(error),
      });
    } finally {
      // Notify that the command was executed even if it failed
      this._emitter.emit("command:executed", { command });
    }
  }

  /**
   * Get the event emitter.
   */
  get emitter() {
    return this._emitter;
  }
}
