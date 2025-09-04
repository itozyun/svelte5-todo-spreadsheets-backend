// Svelte 5 Runesを使用したTODOストア
import type { Todo, FilterType } from '../types/todo';

/**
 * TODOアプリケーションのグローバルストア
 * Svelte 5のRunesシステムを使用した状態管理
 */
export function createTodoStore() {
  // LocalStorageから初期データを読み込み
  const loadFromStorage = (): Todo[] => {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem('svelte5-todos');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Date型の復元
        return parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : undefined
        }));
      } catch (e) {
        console.error('Failed to parse todos from localStorage:', e);
      }
    }
    return [];
  };

  // LocalStorageへの保存
  const saveToStorage = (todos: Todo[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('svelte5-todos', JSON.stringify(todos));
  };

  // リアクティブな状態の定義（初期値はLocalStorageから）
  let todos = $state<Todo[]>(loadFromStorage());
  let filter = $state<FilterType>('all');

  // 派生値の定義
  let filteredTodos = $derived.by(() => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  });

  let activeTodoCount = $derived(
    todos.filter(todo => !todo.completed).length
  );

  let completedTodoCount = $derived(
    todos.filter(todo => todo.completed).length
  );

  // TODOの追加
  function addTodo(text: string) {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: trimmedText,
      completed: false,
      createdAt: new Date()
    };

    todos = [...todos, newTodo];
    saveToStorage(todos);
  }

  // TODOの完了状態を切り替え
  function toggleTodo(id: string) {
    todos = todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
        : todo
    );
    saveToStorage(todos);
  }

  // TODOの削除
  function deleteTodo(id: string) {
    todos = todos.filter(todo => todo.id !== id);
    saveToStorage(todos);
  }

  // TODOのテキストを編集
  function editTodo(id: string, text: string) {
    const trimmedText = text.trim();
    if (!trimmedText) {
      deleteTodo(id);
      return;
    }

    todos = todos.map(todo =>
      todo.id === id
        ? { ...todo, text: trimmedText, updatedAt: new Date() }
        : todo
    );
    saveToStorage(todos);
  }

  // 完了済みのTODOをすべて削除
  function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveToStorage(todos);
  }

  // フィルターの設定
  function setFilter(newFilter: FilterType) {
    filter = newFilter;
  }

  // すべてのTODOの完了状態を切り替え
  function toggleAll() {
    const allCompleted = todos.length > 0 && todos.every(todo => todo.completed);
    todos = todos.map(todo => ({
      ...todo,
      completed: !allCompleted,
      updatedAt: new Date()
    }));
    saveToStorage(todos);
  }

  return {
    get todos() { return todos; },
    get filter() { return filter; },
    get filteredTodos() { return filteredTodos; },
    get activeTodoCount() { return activeTodoCount; },
    get completedTodoCount() { return completedTodoCount; },
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
    setFilter,
    toggleAll
  };
}

// グローバルインスタンスの作成
export const todoStore = createTodoStore();