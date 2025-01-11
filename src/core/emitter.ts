import { EventEmitter } from "events";

import StrictEventEmitter from "strict-event-emitter-types";

import { Command } from "./command.ts";

export type BaseCommandExecutorEvents<Context> = {
  "command:executing": { command: Command<Context> };
  "command:executed": { command: Command<Context> };
  "command:failed": { command: Command<Context>; error: Error };
  "command:succeeded": { command: Command<Context> };
};

export type CommandExecutorEmitter<
  Context,
  Events extends Record<string, unknown> = {},
> = StrictEventEmitter<
  EventEmitter,
  Events & BaseCommandExecutorEvents<Context>
>;
