#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { TranslatorServiceStack } from "./stacks";
import { getConfig } from "./helpers";

const config = getConfig();

const app = new cdk.App();
new TranslatorServiceStack(app, "TranslatorService", {
  env: { account: config.awsAccountID, region: config.awsRegion },
});
