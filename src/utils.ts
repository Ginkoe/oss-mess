import type { RegistryObject, YarnDep, YarnDepsTree } from ".";
import { CouldNotFetchDependencies } from ".";

import type { AxiosResponse } from "axios";
import axios from "axios";
import { exec as _exec } from "child_process";
import { promisify } from "util";

export const exec = promisify(_exec);

export function rawUserQuery(user: string): string {
  return `https://registry.npmjs.org/-/v1/search?text=maintainer:${user}`;
}

export async function getDeps(): Promise<YarnDepsTree> {
  try {
    const { stdout, stderr } = await exec("npx yarn list --json");
    if (stderr) throw new CouldNotFetchDependencies();
    return JSON.parse(stdout) as YarnDepsTree;
  } catch {
    throw new CouldNotFetchDependencies();
  }
}

export async function getFlaggedPackages(users: string[]): Promise<RegistryObject[]> {
  const pendingResponses = users.map<Promise<AxiosResponse<RegistryObject>>>(async (user) =>
    axios.get(rawUserQuery(user)),
  );
  const responses = await Promise.all(pendingResponses);

  const packages = responses.map((response) => response.data);
  return packages;
}

export function hasMarakPackage(deps: YarnDepsTree, marakPackages: RegistryObject): YarnDep[] {
  const { trees } = deps.data;
  const { objects: marakObjects } = marakPackages;

  // Looping over project dependencies
  return trees.filter((dep) => {
    // Checking over Marak packages
    return marakObjects.some((bannedPackage) => {
      return dep.name.split("@")[0] === bannedPackage.package.name;
    });
  });
}
