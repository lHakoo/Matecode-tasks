import { describe, it, expect, vi, beforeEach } from 'vitest';

const addDocMock = vi.fn();
const updateDocMock = vi.fn();
const deleteDocMock = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'tasksCollection'),
  addDoc: (...args: unknown[]) => addDocMock(...args),
  updateDoc: (...args: unknown[]) => updateDocMock(...args),
  deleteDoc: (...args: unknown[]) => deleteDocMock(...args),
  doc: vi.fn((_db, _col, id) => ({ id })),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}));

vi.mock('@/services/firebase', () => ({ db: {} }));

import { createTask, updateTask, deleteTask } from '@/services/taskService';

describe('taskService', () => {
  beforeEach(() => {
    addDocMock.mockClear();
    updateDocMock.mockClear();
    deleteDocMock.mockClear();
  });

  it('createTask envía userId, completed=false y timestamps al crear', async () => {
    await createTask('user-1', { title: '  Nueva tarea  ', description: 'desc' });

    expect(addDocMock).toHaveBeenCalledWith(
      'tasksCollection',
      expect.objectContaining({
        userId: 'user-1',
        title: 'Nueva tarea',
        description: 'desc',
        completed: false,
      }),
    );
  });

  it('updateTask actualiza solo los campos indicados', async () => {
    await updateTask('task-1', { title: 'Nuevo título' });

    expect(updateDocMock).toHaveBeenCalledWith(
      { id: 'task-1' },
      expect.objectContaining({ title: 'Nuevo título' }),
    );
  });

  it('deleteTask elimina el documento correcto', async () => {
    await deleteTask('task-1');
    expect(deleteDocMock).toHaveBeenCalledWith({ id: 'task-1' });
  });
});
