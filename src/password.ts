import { program } from "./cli";

export function password(): string | undefined {
  return program.opts().password;
}
