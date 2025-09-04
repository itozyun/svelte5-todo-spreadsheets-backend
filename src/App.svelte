<script lang="ts">
  import { todoStore } from './stores/todo.svelte';
  import TodoHeader from './components/TodoHeader.svelte';
  import TodoItem from './components/TodoItem.svelte';
  import TodoFooter from './components/TodoFooter.svelte';

  // すべて選択/解除ボタンの状態
  let allCompleted = $derived(
    todoStore.todos.length > 0 && 
    todoStore.todos.every(todo => todo.completed)
  );
</script>

<div class="todoapp">
  <TodoHeader onAddTodo={todoStore.addTodo} />
  
  {#if todoStore.todos.length > 0}
    <section class="main">
      <div class="main-header">
        <input 
          id="toggle-all" 
          class="toggle-all" 
          type="checkbox"
          checked={allCompleted}
          onchange={todoStore.toggleAll}
        />
        <label for="toggle-all" class="toggle-all-label">
          {allCompleted ? 'Unmark all' : 'Mark all as complete'}
        </label>
      </div>
      
      <ul class="todo-list">
        {#each todoStore.filteredTodos as todo (todo.id)}
          <TodoItem
            {todo}
            onToggle={todoStore.toggleTodo}
            onDelete={todoStore.deleteTodo}
            onEdit={todoStore.editTodo}
          />
        {/each}
      </ul>
    </section>
  {/if}

  <TodoFooter
    activeCount={todoStore.activeTodoCount}
    completedCount={todoStore.completedTodoCount}
    currentFilter={todoStore.filter}
    onFilterChange={todoStore.setFilter}
    onClearCompleted={todoStore.clearCompleted}
  />
</div>

<div class="info">
  <p>Double-click to edit a todo</p>
  <p>Built with <a href="https://svelte.dev">Svelte 5</a> and TypeScript</p>
  <p>Part of <a href="https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript">Svelte & SvelteKit with TypeScript Guide</a></p>
</div>

<style>
  :global(html),
  :global(body) {
    margin: 0;
    padding: 0;
  }

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
    font-size: 14px;
    line-height: 1.5;
    color: #24292f;
    background-color: #ffffff;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(body.dark) {
    color: #c9d1d9;
    background-color: #0d1117;
  }

  .todoapp {
    max-width: 768px;
    margin: 0 auto;
    padding: 32px 16px;
  }

  .main {
    margin-top: 16px;
  }

  .main-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .toggle-all {
    width: 20px;
    height: 20px;
    margin: 0;
    cursor: pointer;
  }

  .toggle-all-label {
    font-size: 14px;
    color: #57606a;
    cursor: pointer;
    user-select: none;
  }

  :global(body.dark) .toggle-all-label {
    color: #8b949e;
  }

  .todo-list {
    margin: 0;
    padding: 0;
    list-style: none;
    border: 1px solid #d1d9e0;
    border-radius: 6px;
    overflow: hidden;
  }

  :global(body.dark) .todo-list {
    border-color: #30363d;
  }

  .info {
    margin-top: 40px;
    padding: 20px;
    text-align: center;
    font-size: 12px;
    color: #57606a;
    border-top: 1px solid #d1d9e0;
  }

  :global(body.dark) .info {
    color: #8b949e;
    border-color: #30363d;
  }

  .info p {
    margin: 8px 0;
  }

  .info a {
    color: #0969da;
    text-decoration: none;
  }

  :global(body.dark) .info a {
    color: #58a6ff;
  }

  .info a:hover {
    text-decoration: underline;
  }
</style>
