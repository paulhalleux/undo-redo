import { Command, CommandExecutor, UndoableCommand } from "./command.ts";
import { CommandExecutorEmitter } from "./emitter.ts";
import { HistoryManager, HistoryManagerOptions } from "./history-manager.ts";
import { SimpleCommandExecutor } from "./simple-command-executor.ts";

export type HistoryCommandExecutorEvents<Context> = {
  "command:undo": { command: UndoableCommand<Context> };
  "command:redo": { command: UndoableCommand<Context> };
};

/**
 * HistoryCommandExecutor
 * ---
 * Command executor that keeps track of the history of commands executed.
 * It internally uses a {@link SimpleCommandExecutor} to execute commands.
 * And a {@link HistoryManager} to keep track of the history.
 */
export class HistoryCommandExecutor<Context = unknown>
  implements CommandExecutor<Context>
{
  private _baseExecutor: CommandExecutor<Context>;
  private _history: HistoryManager<UndoableCommand<Context>>;
  private _emitter: CommandExecutorEmitter<
    Context,
    HistoryCommandExecutorEvents<Context>
  >;

  constructor({ maxHistoryLength }: HistoryManagerOptions) {
    const baseExecutor = new SimpleCommandExecutor();
    this._baseExecutor = baseExecutor;

    this._history = new HistoryManager<UndoableCommand<Context>>({
      maxHistoryLength,
    });

    this._emitter = baseExecutor.emitter as CommandExecutorEmitter<
      Context,
      HistoryCommandExecutorEvents<Context>
    >;
  }

  /**
   * Execute a command and add it to the history.
   * @param command Command to execute.
   */
  execute(command: Command<Context>): void {
    this._baseExecutor.execute(command);
    if (this.isUndoable(command)) {
      this._history.push(command);
    }
  }

  /**
   * Undo the last command executed.
   */
  undo(): void {
    const current = this._history.getCurrent();
    if (current) {
      current.undo();
      this._history.undo();
      this._emitter.emit("command:undo", { command: current });
    }
  }

  /**
   * Redo the last command undone.
   */
  redo(): void {
    const command = this._history.redo();
    if (command) {
      command.execute();
      this._emitter.emit("command:redo", { command });
    }
  }

  /**
   * Get the event emitter.
   */
  get emitter() {
    return this._emitter;
  }

  /**
   * Get the history manager.
   */
  get history() {
    return this._history;
  }

  /**
   * Check if the command is undoable.
   * @param command Command to check.
   * @returns True if the command is undoable.
   * @private
   */
  private isUndoable(
    command: Command<Context>,
  ): command is UndoableCommand<Context> {
    return "undo" in command && typeof command.undo === "function";
  }
}
