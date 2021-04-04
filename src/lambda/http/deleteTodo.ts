import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as AWS from 'aws-sdk'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    console.log('todoId', todoId)

    await docClient
      .delete({
        TableName: todosTable,
        Key: {
          HashKey: todoId,
          NumberRangeKey: 1
        }
      })
      .promise()

    return {
      statusCode: 204,
      body: JSON.stringify({
        todoId
      })
    }
  }
)

handler.use(
  cors({
    orifion: '*',
    credentials: true
  })
)
