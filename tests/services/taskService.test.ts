import { describe, it, expect, vi, beforeEach } from 'vitest';

const addDocMock = vi.fn();
const updateDocMock = vi.fn();
const deleteDocMock = vi.fn();
const batchUpdateMock = vi.fn();
const batchCommitMock = vi.fn();

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
  writeBatch: vi.fn(() => ({
    update: batchUpdateMock,
    commit: batchCommitMock,
  })),
  Timestamp: class {},
}));

vi.mock('@/services/firebase', () => ({ db: {} }));

import { createTask, updateTask, deleteTask, reorderTasks } from '@/services/taskService';

describe('taskService', () => {
  beforeEach(() => {
    addDocMock.mockClear();
    updateDocMock.mockClear();
    deleteDocMock.mockClear();
    batchUpdateMock.mockClear();
    batchCommitMock.mockClear();
  });

  it('createTask envía userId, completed=false, order y timestamps al crear', async () => {
    await createTask(
      'user-1',
      { title: '  Nueva tarea  ', description: 'desc', priority: 'high', dueDate: null },
      3,
    );

    expect(addDocMock).toHaveBeenCalledWith(
      'tasksCollection',
      expect.objectContaining({
        userId: 'user-1',
        title: 'Nueva tarea',
        description: 'desc',
        completed: false,
        priority: 'high',
        order: 3,
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

  it('reorderTasks actualiza el campo order de cada tarea en un batch', async () => {
    await reorderTasks(['b', 'a', 'c']);

    expect(batchUpdateMock).toHaveBeenCalledTimes(3);
    expect(batchUpdateMock).toHaveBeenNthCalledWith(1, { id: 'b' }, expect.objectContaining({ order: 0 }));
    expect(batchUpdateMock).toHaveBeenNthCalledWith(2, { id: 'a' }, expect.objectContaining({ order: 1 }));
    expect(batchUpdateMock).toHaveBeenNthCalledWith(3, { id: 'c' }, expect.objectContaining({ order: 2 }));
    expect(batchCommitMock).toHaveBeenCalledTimes(1);
  });
});
