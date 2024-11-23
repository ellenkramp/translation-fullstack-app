import * as lambda from "aws-lambda";
import {
  gateway,
  getTranslation,
  exception,
  TranslationTable,
} from "/opt/nodejs/utils-lambda-layer";
import {
  ITranslateDBObject,
  ITranslateRequest,
  ITranslateResponse,
} from "@tfa/shared-types";

const { TRANSLATION_TABLE_NAME, TRANSLATION_PARTITION_KEY } = process.env;

if (!TRANSLATION_TABLE_NAME) {
  throw new exception.MissingEnvironmentVariable("TRANSLATION_TABLE_NAME");
}

if (!TRANSLATION_PARTITION_KEY) {
  throw new exception.MissingEnvironmentVariable("TRANSLATION_PARTITION_KEY");
}

const translateTable = new TranslationTable({
  tableName: TRANSLATION_TABLE_NAME,
  partitionKey: TRANSLATION_PARTITION_KEY,
});

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

    const tableObj: ITranslateDBObject = {
      ...body,
      ...returnData,
      requestId: context.awsRequestId,
    };

    await translateTable.insert(tableObj);

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
    const returnData = await translateTable.getAll();
    return gateway.createSuccessJsonResponse(returnData);
  } catch (e: any) {
    console.error(e);
    return gateway.createErrorJsonResponse(e);
  }
};
