import { exec as _exec } from "child_process";
import { promisify } from "util";

export const exec = promisify(_exec);

export function rawUserQuery(user: string): string {
  return `https://registry.npmjs.org/-/v1/search?text=maintainer:${user}`;
}
