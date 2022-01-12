export interface YarnDep {
  name: string;
}

export interface YarnDepsTree {
  data: { type: string; trees: YarnDep[] };
}

export interface Person {
  name: string;
  email?: string;
}

export interface RegistryPackage {
  package: {
    name: string;
    author: Person;
    maintainers: Person[];
  };
}

export interface RegistryObject {
  objects: RegistryPackage[];
}
