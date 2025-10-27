// Svelte 5 Runesを使用したTODOストア
import type { Todo, FilterType } from '../types/todo';
import localStorage from './localStorage';
import dbStorage from './dbStorage';

/**
 * TODOアプリケーションのグローバルストア
 * Svelte 5のRunesシステムを使用した状態管理
 */
export function createTodoStore() {
  const storage = import.meta.env.DEV ? localStorage : dbStorage;

  // リアクティブな状態の定義（初期値はLocalStorageから）
  const todos = $state<Todo[]>([]);

  // LocalStorageから初期データを読み込み
  storage.load(todos);

  let filter = $state<FilterType>('all');

  // 派生値の定義
  const filteredTodos = $derived.by(() => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  });

  const activeTodoCount = $derived(
    todos.filter(todo => !todo.completed).length
  );

  const completedTodoCount = $derived(
    todos.filter(todo => todo.completed).length
  );

  // TODOの追加
  function addTodo(label: string) {
    const trimmedText = label.trim();

    if (trimmedText) {
      storage.insert(todos, {
        label    : trimmedText,
        completed: false
      });
    };
  }

  // TODOの完了状態を切り替え
  function toggleTodo(id: string) {
    for (let i=0, l=todos.length; i<l; ++i) {
      const todo = todos[i];
      if (todo.id === id) {
        storage.update(todos, todo, {completed: !todo.completed});
        break;
      };
    };
  }

  // TODOの削除
  function deleteTodo(id: string) {
    for (let i=0, l=todos.length; i<l; ++i) {
      const todo = todos[i];
      if (todo.id === id) {
        storage.remove(todos, todo);
        break;
      };
    };
  }

  // TODOのテキストを編集
  function editTodo(id: string, label: string) {
    const trimmedText = label.trim();

    if (!trimmedText) {
      deleteTodo(id);
    } else {
      for (let i=0, l=todos.length; i<l; ++i) {
        const todo = todos[i];
        if (todo.id === id) {
          storage.update(todos, todo, {label: trimmedText});
          break;
        };
      };
    };
  }

  // 完了済みのTODOをすべて削除
  function clearCompleted() {
    const deleteTodos = [];

    for (let i = todos.length; i;) {
      const todo = todos[--i];
      if (todo.completed) {
        deleteTodos.push(todo);
      };
    };
    storage.remove(todos, deleteTodos);
  }

  // フィルターの設定
  function setFilter(newFilter: FilterType) {
    filter = newFilter;
  }

  // すべてのTODOの完了状態を切り替え(表示中のものに限る)
  function toggleAll() {
    const allCompleted = filteredTodos.length > 0 && filteredTodos.every(todo => todo.completed);
    const updateTodos = [];

    for (let i = filteredTodos.length; i;) {
        const todo = filteredTodos[--i];
        if (todo.completed === allCompleted) {
          updateTodos.push(todo);
        };
    };
    if (updateTodos.length) {
      storage.update(todos, updateTodos, {completed: !allCompleted});
    };
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