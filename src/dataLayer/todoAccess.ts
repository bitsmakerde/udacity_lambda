import * as AWS from "aws-sdk";
const AWSXRay = require("aws-xray-sdk");
import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { createLogger } from "../utils/logger";
const logger = createLogger("todoAccess");
const XAWS = AWSXRay.captureAWS(AWS);

import { TodoItem } from "../models/TodoItem";

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly indexName = process.env.INDEX_NAME
  ) {}

  async getTodosFor(userId: string): Promise<TodoItem[]> {
    console.log("Getting all todos");

    var params = {
      TableName: this.todosTable,
      indexName: this.indexName,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };

    const result = await this.docClient.query(params).promise();

    const items = result.Items;
    logger.info("items", result);
    logger.info("items", items);
    return items as TodoItem[];
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem,
      })
      .promise();

    return todoItem;
  }
}

function createDynamoDBClient() {
  /* if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  } */

  return new XAWS.DynamoDB.DocumentClient();
}
