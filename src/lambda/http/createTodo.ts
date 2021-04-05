import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CreateTodoRequest } from "../../requests/CreateTodoRequest";

import * as uuid from "uuid";
import { parseUserId } from "../../auth/utils";
import { TodoItem } from "../../models/TodoItem";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { TodosAccess } from "../../dataLayer/todoAccess";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body);
    const todoId = uuid.v4();

    const authorization = event.headers.Authorization;
    const split = authorization.split(" ");
    const jwtToken = split[1];

    const userId = parseUserId(jwtToken);

    const newTotoItem = {
      userId,
      todoId,
      createdAt: new Date().toISOString(),
      done: false,
      ...newTodo,
    } as TodoItem;

    const todosAcess = new TodosAccess();
    await todosAcess.createTodo(newTotoItem);

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newTotoItem,
      }),
    };
  }
);

handler.use(
  cors({
    credentials: true,
  })
);
