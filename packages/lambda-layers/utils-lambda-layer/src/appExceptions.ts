export class MissingEnvironmentVariable extends Error {
  constructor(variableName: string) {
    super(`Environment variable not passed: ${variableName}`);
  }
}

export class MissingBodyData extends Error {
  constructor() {
    super("Body data is empty");
  }
}

export class MissingParams extends Error {
  constructor(param: string) {
    super(`Missing parameter: ${param}`);
  }
}
