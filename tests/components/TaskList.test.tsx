import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskList } from '@/components/TaskList';
import type { Task } from '@/types/task';

const baseTask: Task = {
  id: '1',
  userId: 'u1',
  title: 'Tarea 1',
  description: 'Desc 1',
  completed: false,
  priority: 'medium',
  dueDate: null,
  order: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe('TaskList', () => {
  it('muestra el estado de carga', () => {
    render(
      <TaskList tasks={[]} loading error={null} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />,
    );
    expect(screen.getByText(/cargando tareas/i)).toBeInTheDocument();
  });

  it('muestra el mensaje de error', () => {
    render(
      <TaskList
        tasks={[]}
        loading={false}
        error="Firestore no disponible"
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/firestore no disponible/i);
  });

  it('muestra el estado vacío cuando no hay tareas', () => {
    render(
      <TaskList tasks={[]} loading={false} error={null} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />,
    );
    expect(screen.getByText(/no tenés tareas/i)).toBeInTheDocument();
  });

  it('renderiza una tarea por cada item de la lista', () => {
    render(
      <TaskList
        tasks={[baseTask, { ...baseTask, id: '2', title: 'Tarea 2' }]}
        loading={false}
        error={null}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getAllByTestId('task-item')).toHaveLength(2);
  });

  it('muestra el badge de prioridad de cada tarea', () => {
    render(
      <TaskList
        tasks={[{ ...baseTask, priority: 'high' }]}
        loading={false}
        error={null}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText('Alta')).toBeInTheDocument();
  });
});
