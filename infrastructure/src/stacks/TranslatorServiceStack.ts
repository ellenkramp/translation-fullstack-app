import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  RestApiService,
  TranslationService,
  StaticWebsiteDeployment,
  UserAuthSupportService,
} from "../constructs";

// const config = getConfig();
// use if assigning domains, web url, and api url

export class TranslatorServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userAuth = new UserAuthSupportService(this, "userAuthSupport");

    const restApi = new RestApiService(this, "restApiService", {
      userPool: userAuth.userPool,
    });
    
    new TranslationService(this, "translationService", {
      restApi,
    });

    new StaticWebsiteDeployment(this, "staticWebsiteDeployment");
  }
}
