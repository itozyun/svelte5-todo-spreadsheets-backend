<script lang="ts">
  import type { FilterType } from '../types/todo';

  // Props定義
  interface Props {
    activeCount: number;
    completedCount: number;
    currentFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    onClearCompleted: () => void;
  }

  let { 
    activeCount, 
    completedCount, 
    currentFilter, 
    onFilterChange, 
    onClearCompleted 
  }: Props = $props();

  // フィルターオプション
  const filters: { value: FilterType; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: 'M8 2.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11ZM8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Z' },
    { value: 'active', label: 'Active', icon: 'M8 4a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75v-4A.75.75 0 0 1 8 4Z' },
    { value: 'completed', label: 'Completed', icon: 'M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z' }
  ];
</script>

{#if activeCount > 0 || completedCount > 0}
  <footer class="footer">
    <div class="footer-content">
      <div class="todo-count">
        <svg viewBox="0 0 16 16" width="16" height="16" class="count-icon">
          <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
        </svg>
        <span>
          <strong>{activeCount}</strong> {activeCount === 1 ? 'task' : 'tasks'} remaining
        </span>
      </div>
      
      <div class="filters">
        {#each filters as filter}
          <button
            class="filter-btn"
            class:selected={currentFilter === filter.value}
            onclick={() => onFilterChange(filter.value)}
            aria-label="Filter {filter.label}"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" class="filter-icon">
              <path d={filter.icon}></path>
            </svg>
            {filter.label}
          </button>
        {/each}
      </div>
    </div>

    {#if completedCount > 0}
      <div class="clear-section">
        <button 
          class="clear-completed" 
          onclick={onClearCompleted}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" class="clear-icon">
            <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"></path>
          </svg>
          Clear completed ({completedCount})
        </button>
      </div>
    {/if}
  </footer>
{/if}

<style>
  .footer {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #d1d9e0;
  }

  :global(body.dark) .footer {
    border-color: #30363d;
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .clear-section {
    margin-top: 16px;
    display: flex;
    justify-content: center;
  }

  .todo-count {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #57606a;
  }

  :global(body.dark) .todo-count {
    color: #8b949e;
  }

  .count-icon {
    fill: currentColor;
  }

  .todo-count strong {
    font-weight: 600;
    color: #24292f;
  }

  :global(body.dark) .todo-count strong {
    color: #c9d1d9;
  }

  .filters {
    display: flex;
    gap: 4px;
    background: #f6f8fa;
    border: 1px solid #d1d9e0;
    border-radius: 6px;
    padding: 2px;
  }

  :global(body.dark) .filters {
    background: #161b22;
    border-color: #30363d;
  }

  .filter-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 500;
    color: #57606a;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }

  :global(body.dark) .filter-btn {
    color: #8b949e;
  }

  .filter-btn:hover {
    background: #ffffff;
    color: #24292f;
  }

  :global(body.dark) .filter-btn:hover {
    background: #21262d;
    color: #c9d1d9;
  }

  .filter-btn.selected {
    background: #ffffff;
    color: #24292f;
    box-shadow: 0 1px 3px rgba(31, 35, 40, 0.12), 0 0 0 1px rgba(31, 35, 40, 0.04);
  }

  :global(body.dark) .filter-btn.selected {
    background: #0d1117;
    color: #c9d1d9;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(139, 148, 158, 0.2);
  }

  .filter-icon {
    fill: currentColor;
  }

  .clear-completed {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #cf222e;
    background: transparent;
    border: 1px solid #cf222e;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }

  :global(body.dark) .clear-completed {
    color: #f85149;
    border-color: #f85149;
  }

  .clear-completed:hover {
    background: #ffebe9;
    border-color: #cf222e;
  }

  :global(body.dark) .clear-completed:hover {
    background: rgba(248, 81, 73, 0.1);
    border-color: #f85149;
  }

  .clear-icon {
    fill: currentColor;
  }

  @media (max-width: 640px) {
    .footer-content {
      flex-direction: column;
      align-items: stretch;
    }

    .filters {
      justify-content: center;
    }
  }
</style>