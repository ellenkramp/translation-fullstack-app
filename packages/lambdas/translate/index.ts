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

const {
  TRANSLATION_TABLE_NAME,
  TRANSLATION_PARTITION_KEY,
  TRANSLATION_SORT_KEY,
} = process.env;

if (!TRANSLATION_TABLE_NAME) {
  throw new exception.MissingEnvironmentVariable("TRANSLATION_TABLE_NAME");
}

if (!TRANSLATION_PARTITION_KEY) {
  throw new exception.MissingEnvironmentVariable("TRANSLATION_PARTITION_KEY");
}

if (!TRANSLATION_SORT_KEY) {
  throw new exception.MissingEnvironmentVariable("TRANSLATION_SORT_KEY");
}

const translateTable = new TranslationTable({
  tableName: TRANSLATION_TABLE_NAME,
  partitionKey: TRANSLATION_PARTITION_KEY,
  sortKey: TRANSLATION_SORT_KEY,
});

const getUsername = (event: lambda.APIGatewayProxyEvent) => {
  const claims = event.requestContext.authorizer?.claims;

  if (!claims) {
    throw new Error("user not authenticated");
  }

  const username = claims["cognito:username"];

  if (!username) {
    throw Error("username doesn't exist");
  }

  return username;
};

export const publicTranslate: lambda.APIGatewayProxyHandler = async function (
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

    return gateway.createSuccessJsonResponse(returnData);
  } catch (e: any) {
    console.error(e);
    return gateway.createErrorJsonResponse(e);
  }
};

export const userTranslate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    const username = getUsername(event);

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
      username,
    };

    await translateTable.insert(tableObj);

    return gateway.createSuccessJsonResponse(returnData);
  } catch (e: any) {
    console.error(e);
    return gateway.createErrorJsonResponse(e);
  }
};

export const getUserTranslations: lambda.APIGatewayProxyHandler =
  async function (event: lambda.APIGatewayProxyEvent, context: lambda.Context) {
    try {
      const username = getUsername(event);
      const returnData = await translateTable.query({ username });
      return gateway.createSuccessJsonResponse(returnData);
    } catch (e: any) {
      console.error(e);
      return gateway.createErrorJsonResponse(e);
    }
  };
