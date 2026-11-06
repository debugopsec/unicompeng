<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import TodoRow from './TodoRow.vue'

interface Todo {
  id: string
  title: string
  course?: string
  type?: string
  dueDate?: string | null
  notes?: string
  createdAt?: string
}

const STORAGE_KEY = 'ceh-completed-todos'
const REFRESH_INTERVAL = 20_000

const todos = ref<Todo[]>([])
const completedMap = ref<Record<string, boolean>>({})
const loading = ref(true)
const error = ref('')
const lastUpdated = ref<Date | null>(null)

let refreshTimer: ReturnType<typeof setInterval> | undefined

const openTodos = computed(() =>
  sortByDue(todos.value.filter((todo) => !completedMap.value[todo.id]))
)
const doneTodos = computed(() =>
  sortByDue(todos.value.filter((todo) => completedMap.value[todo.id]))
)
const lastChecked = computed(() =>
  lastUpdated.value
    ? lastUpdated.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''
)

function sortByDue(items: Todo[]) {
  return [...items].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) {
      return (a.createdAt || '').localeCompare(b.createdAt || '')
    }
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return a.dueDate.localeCompare(b.dueDate)
  })
}

function loadCompleted() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    completedMap.value = saved ? JSON.parse(saved) : {}
  } catch {
    completedMap.value = {}
  }
}

function toggleTodo(id: string) {
  completedMap.value = {
    ...completedMap.value,
    [id]: !completedMap.value[id]
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedMap.value))
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

async function load(silent = false) {
  if (!silent) loading.value = true

  try {
    const response = await fetch(
      `${import.meta.env.BASE_URL}todos.json?t=${Date.now()}`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    todos.value = Array.isArray(data) ? data : []
    error.value = ''
    lastUpdated.value = new Date()
  } catch {
    if (!silent || !lastUpdated.value) {
      error.value =
        'Could not load the task list. Make sure public/todos.json exists and the task watcher is running.'
    }
  } finally {
    if (!silent) loading.value = false
  }
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') {
    load(true)
  }
}

onMounted(() => {
  loadCompleted()
  load()
  refreshTimer = setInterval(() => load(true), REFRESH_INTERVAL)
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <div class="todo-app">
    <div class="todo-toolbar">
      <span class="todo-updated">
        <template v-if="lastUpdated">Last checked at {{ lastChecked }}</template>
        <template v-else>Checking for tasks…</template>
      </span>

      <button
        class="todo-refresh"
        type="button"
        :disabled="loading"
        @click="load()"
      >
        {{ loading ? 'Refreshing…' : 'Refresh' }}
      </button>
    </div>

    <p v-if="error" class="todo-error">{{ error }}</p>

    <p v-else-if="loading && todos.length === 0" class="todo-empty">
      Loading tasks…
    </p>

    <p v-else-if="todos.length === 0" class="todo-empty">
      No tasks yet. New homework and essay announcements will appear here
      automatically.
    </p>

    <template v-else>
      <h2 class="todo-section-title">
        Open tasks
        <span class="todo-count">{{ openTodos.length }}</span>
      </h2>

      <p v-if="openTodos.length === 0" class="todo-empty">
        All caught up 🎉
      </p>

      <ul v-else class="todo-list">
        <TodoRow
          v-for="todo in openTodos"
          :key="todo.id"
          :todo="todo"
          :done="false"
          @toggle="toggleTodo"
        />
      </ul>

      <details v-if="doneTodos.length" class="todo-completed">
        <summary>Completed ({{ doneTodos.length }})</summary>
        <ul class="todo-list">
          <TodoRow
            v-for="todo in doneTodos"
            :key="todo.id"
            :todo="todo"
            :done="true"
            @toggle="toggleTodo"
          />
        </ul>
      </details>

      <p class="todo-hint">
        Completion is saved in this browser only. The task list is updated
        automatically.
      </p>
    </template>
  </div>
</template>

<style scoped>
.todo-app {
  margin-top: 24px;
}

.todo-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.todo-updated {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.todo-refresh {
  padding: 6px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition:
    border-color 0.25s,
    color 0.25s;
}

.todo-refresh:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.todo-refresh:disabled {
  opacity: 0.6;
  cursor: wait;
}

.todo-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 24px 0 12px;
  border-top: none;
  padding-top: 0;
  font-size: 18px;
}

.todo-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background-color: var(--vp-c-bg-alt);
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.todo-empty {
  margin: 12px 0;
  padding: 24px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 12px;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  text-align: center;
}

.todo-error {
  margin: 12px 0;
  padding: 16px;
  border: 1px solid var(--vp-c-danger-1, #e5484d);
  border-radius: 12px;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-danger-1, #e5484d);
}

.todo-completed {
  margin-top: 28px;
}

.todo-completed summary {
  color: var(--vp-c-text-1);
  font-weight: 600;
  cursor: pointer;
}

.todo-completed .todo-list {
  margin-top: 12px;
}

.todo-hint {
  margin-top: 16px;
  font-size: 12px;
  color: var(--vp-c-text-3);
}
</style>
