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
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Task, TaskDraft } from '@/types/task';

const TASKS_COLLECTION = 'tasks';

/**
 * Se suscribe en tiempo real a las tareas del usuario indicado.
 * Firestore ya filtra server-side por userId, y las Security Rules
 * (ver README) impiden que un usuario lea documentos de otro.
 */
export function subscribeToUserTasks(
  userId: string,
  onChange: (tasks: Task[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
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
          createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
          updatedAt: data.updatedAt?.toMillis?.() ?? Date.now(),
        };
      });
      onChange(tasks);
    },
    onError,
  );
}

export async function createTask(userId: string, draft: TaskDraft): Promise<void> {
  await addDoc(collection(db, TASKS_COLLECTION), {
    userId,
    title: draft.title.trim(),
    description: draft.description.trim(),
    completed: false,
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
