import { useState, type FormEvent } from 'react';
import { isValidTaskTitle, dateInputToTimestamp, timestampToDateInput } from '@/utils/validation';
import type { TaskDraft, TaskPriority } from '@/types/task';
import { PRIORITY_LABEL } from '@/types/task';

interface TaskFormProps {
  onSubmit: (draft: TaskDraft) => Promise<void> | void;
  initialValues?: TaskDraft;
  submitLabel?: string;
  onCancel?: () => void;
}

const PRIORITIES: TaskPriority[] = ['high', 'medium', 'low'];

export function TaskForm({
  onSubmit,
  initialValues,
  submitLabel = 'Agregar tarea',
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(initialValues?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(timestampToDateInput(initialValues?.dueDate ?? null));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidTaskTitle(title)) {
      setError('El título es obligatorio (máx. 120 caracteres).');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        priority,
        dueDate: dateInputToTimestamp(dueDate),
      });
      if (!initialValues) {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" data-testid="task-form">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">
          Título
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="Ej: Enviar factura al cliente"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">
          Descripción
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="Detalles opcionales"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-slate-700">
            Prioridad
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700">
            Fecha de vencimiento
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? 'Guardando...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
