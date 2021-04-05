import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CreateTodoRequest } from "../../requests/CreateTodoRequest";

import * as middy from "middy";
import { cors } from "middy/middlewares";

import { createTodo } from "../../businessLogic/todos";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("createTotos");

    const newTodo: CreateTodoRequest = JSON.parse(event.body);

    const authorization = event.headers.Authorization;
    const split = authorization.split(" ");
    const jwtToken = split[1];
    const todo = await createTodo(newTodo, jwtToken);

    console.log("newTotoItem", todo);

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: todo,
      }),
    };
  }
);

handler.use(
  cors({
    credentials: true,
  })
);
