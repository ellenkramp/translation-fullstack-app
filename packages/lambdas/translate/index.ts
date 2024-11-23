import * as clientTranslate from "@aws-sdk/client-translate";
import * as dynamodb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import * as lambda from "aws-lambda";
import { gateway } from "/opt/nodejs/utils-lambda-layer";
import {
  ITranslateDBObject,
  ITranslateRequest,
  ITranslateResponse,
} from "@tfa/shared-types";

const translateClient = new clientTranslate.TranslateClient({});
const dynamodbClient = new dynamodb.DynamoDBClient({});

const { TRANSLATION_TABLE_NAME, TRANSLATION_PARTITION_KEY } = process.env;

if (!TRANSLATION_TABLE_NAME) {
  throw new Error("TRANSLATION_TABLE_NAME is empty");
}

if (!TRANSLATION_PARTITION_KEY) {
  throw new Error("TRANSLATION_PARTITION_KEY is empty");
}

export const translate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    if (!event.body) {
      throw new Error("no bod");
    }

    const body = JSON.parse(event.body) as ITranslateRequest;

    if (!body.sourceLang) {
      throw new Error("sourceLang is missing");
    }
    if (!body.sourceText) {
      throw new Error("sourceText is missing");
    }
    if (!body.targetLang) {
      throw new Error("targetLang is missing");
    }

    const { sourceLang, targetLang, sourceText } = body;

    const now = new Date(Date.now()).toString();

    const translateCommand = new clientTranslate.TranslateTextCommand({
      SourceLanguageCode: sourceLang,
      TargetLanguageCode: targetLang,
      Text: sourceText,
    });

    const res = await translateClient.send(translateCommand);

    if (!res.TranslatedText) {
      throw new Error("translation is empty");
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
      throw new Error("no items found");
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
