import { program } from "./cli";

export function password(): string | undefined {
  const pwd = program.opts().password;
  return pwd ?? process.env.MINANFT_PASSWORD ?? undefined;
}
