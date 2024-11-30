import * as dynamodb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ITranslateDBObject } from "@tfa/shared-types";

export class TranslationTable {
  tableName: string;
  partitionKey: string;
  sortKey: string;
  dynamodbClient: dynamodb.DynamoDBClient;
  constructor({
    tableName,
    partitionKey,
    sortKey,
  }: {
    tableName: string;
    partitionKey: string;
    sortKey: string;
  }) {
    this.tableName = tableName;
    this.partitionKey = partitionKey;
    this.sortKey = sortKey;
    this.dynamodbClient = new dynamodb.DynamoDBClient({});
  }

  async insert(data: ITranslateDBObject) {
    const tableInsertCommand: dynamodb.PutItemCommandInput = {
      TableName: this.tableName,
      Item: marshall(data),
    };

    await this.dynamodbClient.send(
      new dynamodb.PutItemCommand(tableInsertCommand)
    );
  }

  async query({ username }: { username: string }) {
    const tableQueryCommand: dynamodb.QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: "#PARTITION_KEY = :username",
      ExpressionAttributeNames: {
        "#PARTITION_KEY": "username",
      },
      ExpressionAttributeValues: {
        ":username": { S: username },
      },
      ScanIndexForward: true,
    };

    const { Items } = await this.dynamodbClient.send(
      new dynamodb.QueryCommand(tableQueryCommand)
    );

    if (!Items) {
      return [];
    }

    const returnData = Items.map(
      (item) => unmarshall(item) as ITranslateDBObject
    );

    return returnData;
  }

  async getAll() {
    const scanCommand: dynamodb.ScanCommandInput = {
      TableName: this.tableName,
    };

    const { Items } = await this.dynamodbClient.send(
      new dynamodb.ScanCommand(scanCommand)
    );

    if (!Items) {
      return [];
    }

    const returnData = Items.map(
      (item) => unmarshall(item) as ITranslateDBObject
    );
    return returnData;
  }

  async delete({
    username,
    requestId,
  }: {
    username: string;
    requestId: string;
  }) {
    const tableDeleteCommand: dynamodb.DeleteItemCommandInput = {
      TableName: this.tableName,
      Key: {
        [this.partitionKey]: { S: username },
        [this.sortKey]: { S: requestId },
      },
    };

    await this.dynamodbClient.send(
      new dynamodb.DeleteItemCommand(tableDeleteCommand)
    );
    return this.query({ username });
  }
}
