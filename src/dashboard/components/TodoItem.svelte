<script lang="ts">
  import type { Todo } from '../types/todo';

  // Props定義
  interface Props {
    todo: Todo;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, text: string) => void;
  }

  let { todo, onToggle, onDelete, onEdit }: Props = $props();

  // 編集モードの状態管理
  let isEditing = $state(false);
  let editText = $state(todo.text);

  // 編集開始
  function startEdit() {
    isEditing = true;
    editText = todo.text;
  }

  // 編集確定
  function confirmEdit() {
    if (editText.trim() !== todo.text) {
      onEdit(todo.id, editText);
    }
    isEditing = false;
  }

  // 編集キャンセル
  function cancelEdit() {
    editText = todo.text;
    isEditing = false;
  }

  // キーボードイベント処理
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      confirmEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }
</script>

<li class="todo-item" class:completed={todo.completed}>
  {#if isEditing}
    <div class="edit-container">
      <input
        type="text"
        class="edit-input"
        bind:value={editText}
        onblur={confirmEdit}
        onkeydown={handleKeydown}
        autofocus
      />
    </div>
  {:else}
    <div class="view">
      <input
        type="checkbox"
        class="toggle"
        id="todo-{todo.id}"
        checked={todo.completed}
        onchange={() => onToggle(todo.id)}
      />
      <label for="todo-{todo.id}" class="checkbox-label">
        <svg class="checkbox-icon" viewBox="0 0 16 16" width="16" height="16">
          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
        </svg>
      </label>
      <span class="todo-text" ondblclick={startEdit}>
        {todo.text}
      </span>
      <button class="destroy" onclick={() => onDelete(todo.id)} aria-label="Delete task">
        <svg viewBox="0 0 16 16" width="16" height="16">
          <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"></path>
        </svg>
      </button>
    </div>
  {/if}
</li>

<style>
  .todo-item {
    position: relative;
    list-style: none;
    padding: 0;
    border-bottom: 1px solid #d1d9e0;
    background: #ffffff;
    transition: background-color 0.2s;
  }

  :global(body.dark) .todo-item {
    border-color: #30363d;
    background: #0d1117;
  }

  .todo-item:first-child {
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }

  .todo-item:last-child {
    border-bottom: none;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  .todo-item:hover {
    background: #f6f8fa;
  }

  :global(body.dark) .todo-item:hover {
    background: #161b22;
  }

  .view {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 12px;
  }

  .toggle {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: 1px solid #d1d9e0;
    border-radius: 3px;
    background: #ffffff;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s;
  }

  :global(body.dark) .checkbox-label {
    border-color: #30363d;
    background: #0d1117;
  }

  .checkbox-label:hover {
    border-color: #0969da;
  }

  :global(body.dark) .checkbox-label:hover {
    border-color: #58a6ff;
  }

  .toggle:checked + .checkbox-label {
    background: #0969da;
    border-color: #0969da;
  }

  :global(body.dark) .toggle:checked + .checkbox-label {
    background: #58a6ff;
    border-color: #58a6ff;
  }

  .checkbox-icon {
    display: none;
    fill: #ffffff;
  }

  .toggle:checked + .checkbox-label .checkbox-icon {
    display: block;
  }

  .todo-text {
    flex: 1;
    font-size: 14px;
    line-height: 1.5;
    color: #24292f;
    word-break: break-word;
    cursor: text;
    user-select: text;
  }

  :global(body.dark) .todo-text {
    color: #c9d1d9;
  }

  .completed .todo-text {
    color: #6e7781;
    text-decoration: line-through;
    opacity: 0.7;
  }

  :global(body.dark) .completed .todo-text {
    color: #8b949e;
  }

  .destroy {
    display: none;
    padding: 4px;
    background: none;
    border: none;
    cursor: pointer;
    color: #6e7781;
    transition: color 0.2s;
  }

  :global(body.dark) .destroy {
    color: #8b949e;
  }

  .todo-item:hover .destroy {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .destroy:hover {
    color: #cf222e;
  }

  :global(body.dark) .destroy:hover {
    color: #f85149;
  }

  .destroy svg {
    fill: currentColor;
  }

  .edit-container {
    padding: 8px 16px;
  }

  .edit-input {
    width: 100%;
    padding: 8px 12px;
    font-size: 14px;
    line-height: 20px;
    color: #24292f;
    background-color: #ffffff;
    border: 1px solid #0969da;
    border-radius: 6px;
    box-sizing: border-box;
    font-family: inherit;
    box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
  }

  :global(body.dark) .edit-input {
    color: #c9d1d9;
    background-color: #0d1117;
    border-color: #58a6ff;
    box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
  }

  .edit-input:focus {
    outline: none;
  }
</style>