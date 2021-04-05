import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { parseUserId } from "../../auth/utils";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { TodosAccess } from "../../dataLayer/todoAccess";
import { createLogger } from "../../utils/logger";
const logger = createLogger("getTodos");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Processing event: ", event);
    const todosAcess = new TodosAccess();
    const authorization = event.headers.Authorization;
    const split = authorization.split(" ");
    const jwtToken = split[1];

    const userId = parseUserId(jwtToken);
    const items = await todosAcess.getTodosFor(userId);
    logger.info("items", items);
    return {
      statusCode: 200,
      body: JSON.stringify({
        items,
      }),
    };
  }
);

handler.use(
  cors({
    credentials: true,
  })
);
