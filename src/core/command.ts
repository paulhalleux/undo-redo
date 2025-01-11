/**
 * Command interface
 * ---
 * The Command interface declares a method for executing a command.
 *
 * @template Context - The context type.
 */
export interface Command<Context = unknown> {
  context: Context;
  execute(): void;
}

/**
 * UndoableCommand interface
 * ---
 * The UndoableCommand interface extends the {@link Command} interface by adding an undo method.
 *
 * @template Context - The context type.
 */
export interface UndoableCommand<Context = unknown> extends Command<Context> {
  undo(): void;
}

/**
 * CommandExecutor interface
 * ---
 * The CommandExecutor interface declares a method for executing a command.
 *
 * @template Context - The context type.
 */
export interface CommandExecutor<Context = unknown> {
  execute(command: Command<Context>): void;
}
