export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate: number | null;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export type TaskDraft = Pick<Task, 'title' | 'description' | 'priority' | 'dueDate'>;

export type TaskFilter = 'all' | 'pending' | 'completed';

export type TaskSort = 'manual' | 'priority' | 'dueDate';

export const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};
