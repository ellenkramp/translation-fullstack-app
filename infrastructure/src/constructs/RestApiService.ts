import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cognito from "aws-cdk-lib/aws-cognito";

export interface IRestApiServiceProps extends cdk.StackProps {
  // apiUrl?: string;
  // certificate?: string;
  userPool?: cognito.UserPool;
}

export class RestApiService extends Construct {
  public restApi: apigateway.RestApi;
  public authorizer: apigateway.CognitoUserPoolsAuthorizer;
  public publicResource: cdk.aws_apigateway.Resource;
  public userResource: cdk.aws_apigateway.Resource;

  constructor(
    scope: Construct,
    id: string,
    { userPool }: IRestApiServiceProps
  ) {
    super(scope, id);

    this.restApi = new apigateway.RestApi(this, "translateAPI", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowCredentials: true,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

    this.publicResource = this.restApi.root.addResource("public");
    this.userResource = this.restApi.root.addResource("user");

    if (userPool) {
      this.authorizer = new apigateway.CognitoUserPoolsAuthorizer(
        this.restApi,
        "authorizer",
        {
          cognitoUserPools: [userPool],
          authorizerName: "userPoolAuthorizer",
        }
      );
    }
  }

  addTranslateMethod({
    resource,
    httpMethod,
    lambda,
    isAuth,
  }: {
    resource: apigateway.Resource;
    httpMethod: string;
    lambda: lambda.IFunction;
    isAuth?: boolean;
  }) {
    let options: apigateway.MethodOptions = {};

    if (isAuth) {
      if (!this.authorizer) {
        throw new Error("authorizer not set");
      }
      options = {
        authorizer: this.authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      };
    }
    resource.addMethod(
      httpMethod,
      new apigateway.LambdaIntegration(lambda),
      options
    );
  }
}
