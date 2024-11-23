import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  RestApiService,
  TranslationService,
  StaticWebsiteDeplyment,
} from "../constructs";

// const config = getConfig();
// use if assigning domains, web url, and api url

export class TranslatorServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const restApi = new RestApiService(this, "restApiService");
    new TranslationService(this, "translationService", {
      restApi,
    });

    new StaticWebsiteDeplyment(this, "staticWebsiteDeployment");
  }
}
