// TODOアイテムの型定義
export interface Todo {
  id: string;
  label: string;
  completed: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// フィルター種別の型
export type FilterType = 'all' | 'active' | 'completed';

// TODOストアの型定義
export interface TodoStore {
  todos: Todo[];
  filter: FilterType;
  filteredTodos: Todo[];
  activeTodoCount: number;
  completedTodoCount: number;
  addTodo: (label: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, label: string) => void;
  clearCompleted: () => void;
  setFilter: (filter: FilterType) => void;
  toggleAll: () => void;
}