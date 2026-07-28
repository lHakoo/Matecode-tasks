import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { createTask, updateTask, deleteTask, toggleTaskCompleted } from '@/services/taskService';
import { sendTaskSummaryEmail } from '@/services/emailService';
import { Navbar } from '@/components/Navbar';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { TaskFilters } from '@/components/TaskFilters';
import type { TaskDraft } from '@/types/task';

export function TasksPage() {
  const { user } = useAuth();
  const { tasks, allTasks, loading, error, filter, setFilter } = useTasks(user?.uid);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  async function handleCreate(draft: TaskDraft) {
    if (!user) return;
    await createTask(user.uid, draft);
  }

  async function handleEdit(id: string, changes: TaskDraft) {
    await updateTask(id, changes);
  }

  async function handleToggle(id: string, completed: boolean) {
    await toggleTaskCompleted(id, completed);
  }

  async function handleDelete(id: string) {
    await deleteTask(id);
  }

  async function handleSendSummary() {
    if (!user?.email) return;
    setSendingEmail(true);
    setEmailStatus(null);
    const result = await sendTaskSummaryEmail(user.email, allTasks);
    setEmailStatus(result.message);
    setSendingEmail(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Nueva tarea</h2>
          <TaskForm onSubmit={handleCreate} />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <TaskFilters value={filter} onChange={setFilter} />
          <button
            onClick={handleSendSummary}
            disabled={sendingEmail || allTasks.length === 0}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            {sendingEmail ? 'Enviando...' : 'Enviar resumen por email'}
          </button>
        </div>

        {emailStatus && (
          <p className="mb-4 text-sm text-slate-600" role="status">
            {emailStatus}
          </p>
        )}

        <TaskList
          tasks={tasks}
          loading={loading}
          error={error}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </main>
    </div>
  );
}
