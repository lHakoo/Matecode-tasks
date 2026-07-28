import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Task, TaskDraft } from '@/types/task';

const TASKS_COLLECTION = 'tasks';

/**
 * Se suscribe en tiempo real a las tareas del usuario indicado.
 * Firestore ya filtra server-side por userId, y las Security Rules
 * (ver README) impiden que un usuario lea documentos de otro.
 * Se ordena por `order` para que el drag & drop manual sea estable.
 */
export function subscribeToUserTasks(
  userId: string,
  onChange: (tasks: Task[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('userId', '==', userId),
    orderBy('order', 'asc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId,
          title: data.title,
          description: data.description,
          completed: data.completed,
          priority: data.priority ?? 'medium',
          dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toMillis() : (data.dueDate ?? null),
          order: data.order ?? 0,
          createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
          updatedAt: data.updatedAt?.toMillis?.() ?? Date.now(),
        };
      });
      onChange(tasks);
    },
    onError,
  );
}

export async function createTask(
  userId: string,
  draft: TaskDraft,
  nextOrder: number,
): Promise<void> {
  await addDoc(collection(db, TASKS_COLLECTION), {
    userId,
    title: draft.title.trim(),
    description: draft.description.trim(),
    completed: false,
    priority: draft.priority,
    dueDate: draft.dueDate,
    order: nextOrder,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateTask(taskId: string, changes: Partial<TaskDraft>): Promise<void> {
  await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}

export async function toggleTaskCompleted(taskId: string, completed: boolean): Promise<void> {
  await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
    completed,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
}

/**
 * Persiste un nuevo orden manual (drag & drop) en un solo batch write.
 * `orderedIds` ya viene en el orden final deseado.
 */
export async function reorderTasks(orderedIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, TASKS_COLLECTION, id), { order: index, updatedAt: serverTimestamp() });
  });
  await batch.commit();
}
