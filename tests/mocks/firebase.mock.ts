import { vi } from 'vitest';

// Mock del modulo services/firebase para no inicializar Firebase real en tests.
vi.mock('@/services/firebase', () => ({
  auth: {},
  db: {},
  firebaseApp: {},
}));
