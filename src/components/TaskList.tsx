import type { Task, TaskDraft } from '@/types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, changes: TaskDraft) => Promise<void> | void;
}

export function TaskList({ tasks, loading, error, onToggle, onDelete, onEdit }: TaskListProps) {
  if (loading) {
    return <p className="text-sm text-slate-500">Cargando tareas...</p>;
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        Ocurrió un error al cargar tus tareas: {error}
      </p>
    );
  }

  if (tasks.length === 0) {
    return <p className="text-sm text-slate-500">No tenés tareas todavía. ¡Agregá la primera!</p>;
  }

  return (
    <ul className="flex flex-col gap-3" data-testid="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </ul>
  );
}
