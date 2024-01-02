import { program } from "./cli";

export function offline(): boolean {
  return program.opts().offline ?? false;
}
