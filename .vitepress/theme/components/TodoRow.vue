<script setup lang="ts">
import { computed } from 'vue'

interface Todo {
  id: string
  title: string
  course?: string
  type?: string
  dueDate?: string | null
  notes?: string
}

const props = defineProps<{
  todo: Todo
  done: boolean
}>()

const emit = defineEmits<{
  (event: 'toggle', id: string): void
}>()

const typeLabels: Record<string, string> = {
  homework: 'Homework',
  essay: 'Essay',
  report: 'Report',
  project: 'Project',
  quiz: 'Quiz',
  exam: 'Exam',
  lab: 'Lab',
  other: 'Task'
}

const typeLabel = computed(() => typeLabels[props.todo.type || 'other'] || 'Task')

const due = computed(() => {
  if (!props.todo.dueDate) {
    return { label: 'No due date', className: 'none' }
  }

  const date = new Date(`${props.todo.dueDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return { label: 'No due date', className: 'none' }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000)
  const formatted = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  if (diff < 0) return { label: `Overdue · ${formatted}`, className: 'overdue' }
  if (diff === 0) return { label: `Due today · ${formatted}`, className: 'today' }
  if (diff === 1) return { label: `Due tomorrow · ${formatted}`, className: 'soon' }
  return { label: `Due ${formatted}`, className: 'upcoming' }
})
</script>

<template>
  <li class="todo-item" :class="{ done }">
    <input
      class="todo-checkbox"
      type="checkbox"
      :checked="done"
      :aria-label="`Mark ${todo.title} as ${done ? 'not done' : 'done'}`"
      @change="emit('toggle', todo.id)"
    />

    <div class="todo-body">
      <div class="todo-title-row">
        <span class="todo-title">{{ todo.title }}</span>
        <span v-if="todo.type" class="todo-badge todo-type">{{ typeLabel }}</span>
        <span v-if="todo.course" class="todo-badge todo-course">{{ todo.course }}</span>
      </div>

      <p v-if="todo.notes" class="todo-notes">{{ todo.notes }}</p>

      <div class="todo-meta">
        <span class="todo-due" :class="due.className">{{ due.label }}</span>
      </div>
    </div>
  </li>
</template>

<style scoped>
.todo-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background-color: var(--vp-c-bg-soft);
}

.todo-item.done {
  opacity: 0.65;
}

.todo-item.done .todo-title {
  text-decoration: line-through;
}

.todo-checkbox {
  flex: none;
  width: 18px;
  height: 18px;
  margin-top: 3px;
  accent-color: var(--vp-c-brand-1);
  cursor: pointer;
}

.todo-body {
  flex: 1;
  min-width: 0;
}

.todo-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.todo-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--vp-c-text-1);
}

.todo-badge {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.6;
}

.todo-type {
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.todo-course {
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

.todo-notes {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  white-space: pre-wrap;
}

.todo-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
}

.todo-due {
  font-weight: 500;
}

.todo-due.none {
  color: var(--vp-c-text-3);
}

.todo-due.overdue {
  color: var(--vp-c-danger-1, #e5484d);
}

.todo-due.today,
.todo-due.soon {
  color: var(--vp-c-warning-1, #d97706);
}

.todo-due.upcoming {
  color: var(--vp-c-text-2);
}
</style>
