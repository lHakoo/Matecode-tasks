import { useEffect, useMemo, useState } from 'react';
import { subscribeToUserTasks } from '@/services/taskService';
import type { Task, TaskFilter, TaskSort } from '@/types/task';
import { PRIORITY_WEIGHT } from '@/types/task';

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [sort, setSort] = useState<TaskSort>('manual');

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToUserTasks(
      userId,
      (nextTasks) => {
        setTasks(nextTasks);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [userId]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (filter === 'pending') result = result.filter((t) => !t.completed);
    if (filter === 'completed') result = result.filter((t) => t.completed);

    if (sort === 'priority') {
      result = [...result].sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]);
    } else if (sort === 'dueDate') {
      result = [...result].sort((a, b) => {
        if (a.dueDate === null && b.dueDate === null) return 0;
        if (a.dueDate === null) return 1;
        if (b.dueDate === null) return -1;
        return a.dueDate - b.dueDate;
      });
    }
    // 'manual' ya viene ordenado por `order` desde la consulta a Firestore

    return result;
  }, [tasks, filter, sort]);

  const nextOrder = tasks.length > 0 ? Math.max(...tasks.map((t) => t.order)) + 1 : 0;

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    loading,
    error,
    filter,
    setFilter,
    sort,
    setSort,
    nextOrder,
  };
}
