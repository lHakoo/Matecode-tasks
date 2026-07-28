export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export type TaskDraft = Pick<Task, 'title' | 'description'>;

export type TaskFilter = 'all' | 'pending' | 'completed';
