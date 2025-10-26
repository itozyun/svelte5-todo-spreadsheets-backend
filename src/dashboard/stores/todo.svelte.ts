// Svelte 5 Runesを使用したTODOストア
import type { Todo, FilterType } from '../types/todo';
import {save as saveToLocalStorage, load as loadFromLocalStorage} from './localStorage';

/**
 * TODOアプリケーションのグローバルストア
 * Svelte 5のRunesシステムを使用した状態管理
 */
export function createTodoStore() {
  // リアクティブな状態の定義（初期値はLocalStorageから）
  const todos = $state<Todo[]>([]);

  // LocalStorageから初期データを読み込み
  loadFromLocalStorage(todos);

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
    if (!trimmedText) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      label: trimmedText,
      completed: false,
      createdAt: new Date()
    };

    todos.push(newTodo);
    saveToLocalStorage(todos);
  }

  // TODOの完了状態を切り替え
  function toggleTodo(id: string) {
    /* todos = todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
        : todo
    ); */
    for(let i=0, l= todos.length; i<l; ++i){
      const todo = todos[i];
      if (todo.id === id){
        todo.completed = !todo.completed;
        todo.updatedAt = new Date();
        saveToLocalStorage(todos);
        break;
      };
    };
  }

  // TODOの削除
  function deleteTodo(id: string) {
    // todos = todos.filter(todo => todo.id !== id);
    for(let i=0, l= todos.length; i<l; ++i){
      if (todos[i].id === id){
        todos.splice(i, 1);
        saveToLocalStorage(todos);
        break;
      };
    };
  }

  // TODOのテキストを編集
  function editTodo(id: string, label: string) {
    const trimmedText = label.trim();

    if (!trimmedText) {
      deleteTodo(id);
      return;
    }
    for(let i=0, l= todos.length; i<l; ++i){
      const todo = todos[i];
      if (todo.id === id){
        todo.label = trimmedText;
        todo.updatedAt = new Date();
        saveToLocalStorage(todos);
        break;
      };
    };
    /* todos = todos.map(todo =>
      todo.id === id
        ? { ...todo, label: trimmedText, updatedAt: new Date() }
        : todo
    ); */
  }

  // 完了済みのTODOをすべて削除
  function clearCompleted() {
    // todos = todos.filter(todo => !todo.completed);
    let deleted = false;

    for(let i = todos.length; i;){
      if (todos[--i].completed){
        todos.splice(i, 1);
        deleted = true;
      };
    };
    if (deleted) {
      saveToLocalStorage(todos);
    };
  }

  // フィルターの設定
  function setFilter(newFilter: FilterType) {
    filter = newFilter;
  }

  // すべてのTODOの完了状態を切り替え(表示中のものに限る)
  function toggleAll() {
    const allCompleted = filteredTodos.length > 0 && filteredTodos.every(todo => todo.completed);
    /* todos = todos.map(todo => ({
      ...todo,
      completed: !allCompleted,
      updatedAt: new Date()
    })); */
    let updated = false;
    for(let i = filteredTodos.length; i;){
        const todo = filteredTodos[--i];
        if(todo.completed === allCompleted){
          todo.completed = !allCompleted;
          todo.updatedAt = new Date();
          updated = true;
        };
    };
    if (updated) {
      saveToLocalStorage(todos);
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