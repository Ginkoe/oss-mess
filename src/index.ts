import { CouldNotFetchDependencies } from "./exceptions";
import type { RegistryObject, YarnDep, YarnDepsTree } from "./types";
import { exec, rawUserQuery } from "./utils";

import type { AxiosResponse } from "axios";
import axios from "axios";

async function getDeps(): Promise<YarnDepsTree> {
  try {
    const { stdout, stderr } = await exec("npx yarn list --json");
    if (stderr) throw new CouldNotFetchDependencies();
    return JSON.parse(stdout) as YarnDepsTree;
  } catch {
    throw new CouldNotFetchDependencies();
  }
}

async function getFlaggedPackages(users: string[]): Promise<RegistryObject[]> {
  const pendingResponses = users.map<Promise<AxiosResponse<RegistryObject>>>(async (user) =>
    axios.get(rawUserQuery(user)),
  );
  const responses = await Promise.all(pendingResponses);

  const packages = responses.map((response) => response.data);
  return packages;
}

function hasMarakPackage(deps: YarnDepsTree, marakPackages: RegistryObject): YarnDep[] {
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

async function main() {
  const [[marakPackages], projectDeps] = await Promise.all([getFlaggedPackages(["marak"]), getDeps()]);
  if (marakPackages) {
    const marakInProject = hasMarakPackage(projectDeps, marakPackages);
    return marakInProject;
  }

  return [];
}

main()
  .then((foundDependencies) => {
    if (foundDependencies.length > 0) {
      console.log("\u001b[33mPlease make sure to pin the following dependencies to a previous version:\u001b[0m");
      for (const dep of foundDependencies) {
        console.log(dep.name);
      }
      return;
    }

    console.log("👍 \u001b[32mYou seem to be Marakless ~ If your project dependencies are not pinned, please do.");
  })
  .catch((error) => {
    console.error("An error occured", error);
  });
