import * as dynamodb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import * as lambda from "aws-lambda";
import {
  gateway,
  getTranslation,
  exception,
} from "/opt/nodejs/utils-lambda-layer";
import {
  ITranslateDBObject,
  ITranslateRequest,
  ITranslateResponse,
} from "@tfa/shared-types";

const dynamodbClient = new dynamodb.DynamoDBClient({});

const { TRANSLATION_TABLE_NAME, TRANSLATION_PARTITION_KEY } = process.env;

if (!TRANSLATION_TABLE_NAME) {
  throw new exception.MissingEnvironmentVariable("TRANSLATION_TABLE_NAME");
}

if (!TRANSLATION_PARTITION_KEY) {
  throw new exception.MissingEnvironmentVariable("TRANSLATION_PARTITION_KEY");
}

export const translate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    if (!event.body) {
      throw new exception.MissingBodyData();
    }

    const body = JSON.parse(event.body) as ITranslateRequest;

    if (!body.sourceLang) {
      throw new exception.MissingParams("sourceLang");
    }
    if (!body.sourceText) {
      throw new exception.MissingParams("sourceText");
    }
    if (!body.targetLang) {
      throw new exception.MissingParams("targetLang");
    }

    const now = new Date(Date.now()).toString();

    const res = await getTranslation(body);

    if (!res.TranslatedText) {
      throw new exception.MissingParams("TranslatedText");
    }

    const returnData: ITranslateResponse = {
      timestamp: now,
      targetText: res.TranslatedText,
    };

    // save
    const tableObj: ITranslateDBObject = {
      ...body,
      ...returnData,
      requestId: context.awsRequestId,
    };

    const tableInsertCommand: dynamodb.PutItemCommandInput = {
      TableName: TRANSLATION_TABLE_NAME,
      Item: marshall(tableObj),
    };

    await dynamodbClient.send(new dynamodb.PutItemCommand(tableInsertCommand));

    return gateway.createSuccessJsonResponse(returnData);
  } catch (e: any) {
    console.error(e);
    return gateway.createErrorJsonResponse(e);
  }
};

export const getTranslations: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    const scanCommand: dynamodb.ScanCommandInput = {
      TableName: TRANSLATION_TABLE_NAME,
    };

    const { Items } = await dynamodbClient.send(
      new dynamodb.ScanCommand(scanCommand)
    );

    if (!Items) {
      throw new exception.MissingParams("Items");
    }

    const returnData = Items.map(
      (item) => unmarshall(item) as ITranslateDBObject
    );

    return gateway.createSuccessJsonResponse(returnData);
  } catch (e: any) {
    console.error(e);
    return gateway.createErrorJsonResponse(e);
  }
};
