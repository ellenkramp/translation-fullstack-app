import { Construct } from "constructs";
import { RestApiService } from "../constructs";
import * as path from "path";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { lambdaLayersDirPath, lambdasDirPath } from "../helpers/appPaths";
import { createNodeJsLambda } from "../helpers";

export interface ITranslationServiceProps extends cdk.StackProps {
  restApi: RestApiService;
}

export class TranslationService extends Construct {
  public restApi: apigateway.RestApi;
  constructor(
    scope: Construct,
    id: string,
    { restApi }: ITranslationServiceProps
  ) {
    super(scope, id);

    // DynamoDB construct here
    const table = new dynamoDb.Table(this, "translations", {
      tableName: "translations",
      partitionKey: {
        name: "username",
        type: dynamoDb.AttributeType.STRING,
      },
      sortKey: {
        name: "requestId",
        type: dynamoDb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // translate access
    const translateServicePolicy = new iam.PolicyStatement({
      actions: ["translate:TranslateText"],
      resources: ["*"],
    });

    // db table
    const translateTablePolicy = new iam.PolicyStatement({
      actions: [
        "dynamodb:PutItem",
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
      ],
      resources: ["*"],
    });

    const utilsLambdaLayerPath = path.resolve(
      path.join(lambdaLayersDirPath, "utils-lambda-layer")
    );

    const utilsLambdaLayer = new lambda.LayerVersion(this, "utilsLambdaLayer", {
      code: lambda.Code.fromAsset(utilsLambdaLayerPath),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const environment = {
      TRANSLATION_TABLE_NAME: table.tableName,
      TRANSLATION_PARTITION_KEY: "username",
      TRANSLATION_SORT_KEY: "requestId",
    };

    const translateLambda = createNodeJsLambda(this, "translateLambda", {
      lambdaRelativePath: "translate/index.ts",
      handler: "translate",
      initialPolicy: [translateServicePolicy, translateTablePolicy],
      lambdaLayers: [utilsLambdaLayer],
      environment,
    });

    // granting read & write access to db
    table.grantReadWriteData(translateLambda);

    const getTranslations = createNodeJsLambda(this, "getTranslationsLambda", {
      lambdaRelativePath: "translate/index.ts",
      handler: "getTranslations",
      initialPolicy: [translateTablePolicy],
      lambdaLayers: [utilsLambdaLayer],
      environment,
    });

    restApi.addTranslateMethod({
      httpMethod: "GET",
      lambda: getTranslations,
      isAuth: true,
    });

    restApi.addTranslateMethod({
      httpMethod: "POST",
      lambda: translateLambda,
      isAuth: true,
    });
  }
}
