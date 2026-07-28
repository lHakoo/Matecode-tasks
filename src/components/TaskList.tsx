import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import type { Task, TaskDraft } from '@/types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, changes: TaskDraft) => Promise<void> | void;
  onReorder?: (orderedIds: string[]) => void;
  /** El drag & drop manual solo tiene sentido si la lista está sin filtrar/ordenada por otro criterio. */
  dragEnabled?: boolean;
}

export function TaskList({
  tasks,
  loading,
  error,
  onToggle,
  onDelete,
  onEdit,
  onReorder,
  dragEnabled = false,
}: TaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIndex, newIndex);
    onReorder(reordered.map((t) => t.id));
  }

  const list = (
    <ul className="flex flex-col gap-3" data-testid="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          dragDisabled={!dragEnabled}
        />
      ))}
    </ul>
  );

  if (!dragEnabled) {
    return list;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        {list}
      </SortableContext>
    </DndContext>
  );
}
