import type { Todo } from '../types/todo';

export function load(todos: Todo[]) {
  if (typeof window !== 'undefined'){
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

export function save(todos: Todo[]) {
  if (typeof window !== 'undefined'){
    localStorage.setItem('svelte5-todos', JSON.stringify(todos));
  };
};