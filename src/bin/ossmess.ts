#!/bin/env node
import { getDeps, getFlaggedPackages, hasMarakPackage } from "..";

async function main() {
  const [bannedPackages, projectDeps] = await Promise.all([getFlaggedPackages(["marak"]), getDeps()]);
  if (bannedPackages.length > 0) {
    // We're checking if we have at least one element up there.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const marakPackages = bannedPackages[0]!;
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
