import * as uuid from "uuid";

import { TodoItem } from "../models/TodoItem";
import { TodosAccess } from "../dataLayer/todoAccess";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { parseUserId } from "../auth/utils";

const todoAccess = new TodosAccess();

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken);
  return todoAccess.getTodosFor(userId);
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {
  const todoId = uuid.v4();
  const userId = parseUserId(jwtToken);

  return await todoAccess.createTodo({
    todoId,
    userId,
    name: createTodoRequest.name,
    createdAt: new Date().toISOString(),
    done: false,
    ...createTodoRequest,
  });
}
