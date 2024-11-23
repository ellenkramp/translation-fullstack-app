import * as path from "path";
import * as fs from "fs";

const findRootEnv = (searchPath: string): string => {
  if (searchPath === "/") {
    throw new Error(".env file doesn't exist");
  }
  if (fs.readdirSync(searchPath).find((file) => file === ".env")) {
    return searchPath;
  }
  return findRootEnv(path.join(searchPath, "../"));
};

export const projectRoot = findRootEnv(__dirname);
export const projectEnvPath = path.join(projectRoot, ".env");
export const lambdasDirPath = path.join(projectRoot, "packages/lambdas");
export const lambdaLayersDirPath = path.join(
  projectRoot,
  "packages/lambda-layers"
);

export const frontendDistPath = path.join(
  projectRoot,
  "apps/translation-app/dist"
);
