import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, TaskDraft } from '@/types/task';
import { PRIORITY_LABEL } from '@/types/task';
import { TaskForm } from './TaskForm';
import { formatDate, isOverdue } from '@/utils/validation';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, changes: TaskDraft) => Promise<void> | void;
  dragDisabled?: boolean;
}

const PRIORITY_STYLES: Record<Task['priority'], string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
};

export function TaskItem({ task, onToggle, onDelete, onEdit, dragDisabled }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: dragDisabled || isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isEditing) {
    return (
      <li ref={setNodeRef} style={style} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <TaskForm
          initialValues={{
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate,
          }}
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

  const overdue = isOverdue(task.dueDate, task.completed);

  return (
    <li
      ref={setNodeRef}
      style={style}
      data-testid="task-item"
      className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      {!dragDisabled && (
        <button
          type="button"
          className="mt-1 cursor-grab touch-none text-slate-300 hover:text-slate-500 active:cursor-grabbing"
          aria-label={`Reordenar "${task.title}"`}
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
      )}
      <input
        type="checkbox"
        checked={task.completed}
        onChange={(e) => onToggle(task.id, e.target.checked)}
        aria-label={`Marcar "${task.title}" como completada`}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
            {task.title}
          </p>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          {task.dueDate !== null && (
            <span className={`text-xs ${overdue ? 'font-medium text-red-600' : 'text-slate-400'}`}>
              {overdue ? 'Vencida: ' : 'Vence: '}
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
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
