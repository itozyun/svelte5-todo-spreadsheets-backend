import type { Todo, TodoDiff } from '../types/todo';

export default {load, insert, update, remove};

function load(todos: Todo[]) {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('svelte5-todos');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Date型の復元
        parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : undefined
        }));
        todos.push.apply(todos, parsed);
      } catch (e) {
        console.error('Failed to parse todos from localStorage:', e);
      }
    }
  };
};

function _save(todos: Todo[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('svelte5-todos', JSON.stringify(todos));
  };
};

function insert(todos: Todo[], newTodo: Todo) {
  newTodo.id = crypto.randomUUID(),
  newTodo.createdAt = new Date();
  todos.push(newTodo);
  _save(todos);
};

function update(todos: Todo[], targetTodoOrTodos: Todo | Todo[], diff: TodoDiff) {
  function _update(todo: Todo) {
    for (const key in diff) {
      // @ts-ignore
      todo[key] = diff[key];
    };
    todo.updatedAt = new Date();
  };

  if (Array.isArray(targetTodoOrTodos)) {
    const targetTodos = targetTodoOrTodos as Todo[];

    for (let i = 0, l = targetTodos.length; i<l; ++i) {
      _update(targetTodos[i]);
    };
  } else {
    const targetTodo = targetTodoOrTodos as Todo;

    _update(targetTodo);
  };
  _save(todos);
};

function remove(todos: Todo[], targetTodoOrTodos: Todo | Todo[]) {
  function _remove(todo: Todo) {
    todos.splice(todos.indexOf(todo), 1);
  };

  if (Array.isArray(targetTodoOrTodos)) {
    const targetTodos = targetTodoOrTodos as Todo[];

    for (let i = targetTodos.length; i;) {
      _remove(targetTodos[--i]);
    };
  } else {
    const targetTodo = targetTodoOrTodos as Todo;

    _remove(targetTodo);
  };
  _save(todos);
};
