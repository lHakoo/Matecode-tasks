import type { TaskSort } from '@/types/task';

interface TaskSortSelectProps {
  value: TaskSort;
  onChange: (sort: TaskSort) => void;
}

const OPTIONS: { value: TaskSort; label: string }[] = [
  { value: 'manual', label: 'Orden manual (arrastrar)' },
  { value: 'priority', label: 'Prioridad' },
  { value: 'dueDate', label: 'Fecha de vencimiento' },
];

export function TaskSortSelect({ value, onChange }: TaskSortSelectProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      Ordenar por
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TaskSort)}
        className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
