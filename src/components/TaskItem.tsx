import { useState } from 'react';
import type { Task, TaskDraft } from '@/types/task';
import { TaskForm } from './TaskForm';
import { formatDate } from '@/utils/validation';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, changes: TaskDraft) => Promise<void> | void;
}

export function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <TaskForm
          initialValues={{ title: task.title, description: task.description }}
          submitLabel="Guardar cambios"
          onCancel={() => setIsEditing(false)}
          onSubmit={async (draft) => {
            await onEdit(task.id, draft);
            setIsEditing(false);
          }}
        />
      </li>
    );
  }

  return (
    <li
      data-testid="task-item"
      className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={(e) => onToggle(task.id, e.target.checked)}
        aria-label={`Marcar "${task.title}" como completada`}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      <div className="flex-1">
        <p className={`font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="mt-1 text-sm text-slate-500">{task.description}</p>
        )}
        <p className="mt-1 text-xs text-slate-400">Creada el {formatDate(task.createdAt)}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm text-brand-600 hover:underline"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="text-sm text-red-600 hover:underline"
        >
          Eliminar
        </button>
      </div>
    </li>
  );
}
