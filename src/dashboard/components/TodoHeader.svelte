<script lang="ts">
  // Props定義
  interface Props {
    onAddTodo: (text: string) => void;
  }

  let { onAddTodo }: Props = $props();

  // 入力フィールドの状態
  let newTodoText = $state('');

  // TODOの追加処理
  function handleSubmit(e: Event) {
    e.preventDefault();
    if (newTodoText.trim()) {
      onAddTodo(newTodoText);
      newTodoText = '';
    }
  }

  // テーマ切り替え
  function toggleTheme() {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  }

  // 初期テーマ設定
  $effect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark');
    }
  });
</script>

<header class="header">
  <div class="header-content">
    <h1>
      <svg height="32" viewBox="0 0 16 16" width="32" class="octicon">
        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm9.78-2.22-5.25 5.25L3.72 8.72a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042l2.75 2.75a.75.75 0 0 0 1.06 0l5.75-5.75a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018Z"></path>
      </svg>
      Task Manager
    </h1>
    <button class="theme-toggle" onclick={toggleTheme} type="button">
      <svg class="sun-icon" viewBox="0 0 16 16" width="16" height="16">
        <path d="M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-1.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm5.657-8.157a.75.75 0 0 1 0 1.061l-1.061 1.06a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l1.06-1.06a.75.75 0 0 1 1.06 0Zm-9.193 9.193a.75.75 0 0 1 0 1.06l-1.06 1.061a.75.75 0 1 1-1.061-1.06l1.06-1.061a.75.75 0 0 1 1.061 0ZM8 0a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V.75A.75.75 0 0 1 8 0ZM3 8a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 3 8Zm13 0a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 16 8Zm-8 5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 13Zm3.536-1.464a.75.75 0 0 1 1.06 0l1.061 1.06a.75.75 0 0 1-1.06 1.061l-1.061-1.06a.75.75 0 0 1 0-1.061ZM2.343 2.343a.75.75 0 0 1 1.061 0l1.06 1.061a.751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018l-1.06-1.06a.75.75 0 0 1 0-1.06Z"></path>
      </svg>
      <svg class="moon-icon" viewBox="0 0 16 16" width="16" height="16">
        <path d="M9.598 1.591a.749.749 0 0 1 .785-.175 7.001 7.001 0 1 1-8.967 8.967.75.75 0 0 1 .961-.96c.372.19.784.3 1.22.3A5.5 5.5 0 0 0 9.1 3.97a.75.75 0 0 1 .498-2.378Zm1.765.653a6.502 6.502 0 0 1-6.102 9.244 6.002 6.002 0 0 0 6.102-9.244Z"></path>
      </svg>
    </button>
  </div>
  
  <form onsubmit={handleSubmit} class="input-form">
    <input
      class="new-todo"
      placeholder="What needs to be done?"
      bind:value={newTodoText}
      autofocus
    />
    <button type="submit" class="add-button">Add task</button>
  </form>
</header>

<style>
  .header {
    margin-bottom: 24px;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #d1d9e0;
  }

  :global(body.dark) .header-content {
    border-color: #30363d;
  }

  h1 {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #24292f;
  }

  :global(body.dark) h1 {
    color: #c9d1d9;
  }

  .octicon {
    fill: currentColor;
  }

  .theme-toggle {
    padding: 6px 12px;
    background: #f6f8fa;
    border: 1px solid #d1d9e0;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.2s;
  }

  :global(body.dark) .theme-toggle {
    background: #21262d;
    border-color: #30363d;
  }

  .theme-toggle:hover {
    background: #f3f4f6;
    border-color: #8b949e;
  }

  :global(body.dark) .theme-toggle:hover {
    background: #30363d;
    border-color: #8b949e;
  }

  .sun-icon,
  .moon-icon {
    fill: #57606a;
  }

  :global(body.dark) .sun-icon,
  :global(body.dark) .moon-icon {
    fill: #8b949e;
  }

  .sun-icon {
    display: block;
  }

  .moon-icon {
    display: none;
  }

  :global(body.dark) .sun-icon {
    display: none;
  }

  :global(body.dark) .moon-icon {
    display: block;
  }

  .input-form {
    display: flex;
    gap: 8px;
  }

  .new-todo {
    flex: 1;
    padding: 8px 12px;
    font-size: 14px;
    line-height: 20px;
    color: #24292f;
    background-color: #f6f8fa;
    border: 1px solid #d1d9e0;
    border-radius: 6px;
    box-sizing: border-box;
    font-family: inherit;
  }

  :global(body.dark) .new-todo {
    color: #c9d1d9;
    background-color: #0d1117;
    border-color: #30363d;
  }

  .new-todo:focus {
    outline: none;
    border-color: #0969da;
    box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
  }

  :global(body.dark) .new-todo:focus {
    border-color: #58a6ff;
    box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
  }

  .new-todo::placeholder {
    color: #6e7781;
  }

  :global(body.dark) .new-todo::placeholder {
    color: #8b949e;
  }

  .add-button {
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: #ffffff;
    background-color: #1f883d;
    border: 1px solid rgba(31, 35, 40, 0.15);
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    white-space: nowrap;
    transition: background-color 0.2s;
  }

  .add-button:hover {
    background-color: #1a7f37;
  }

  .add-button:active {
    background-color: #187733;
  }
</style>