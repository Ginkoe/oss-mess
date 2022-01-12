export class CouldNotFetchDependencies extends Error {
  public constructor() {
    super("Could not fetch dependencies. Please verify your yarn installation");
    this.name = "CouldNotFetchDependencies";
  }
}
