import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPassword, isValidTaskTitle, formatDate } from '@/utils/validation';

describe('validation utils', () => {
  it('valida emails correctamente', () => {
    expect(isValidEmail('user@matecode.com')).toBe(true);
    expect(isValidEmail('user@matecode')).toBe(false);
    expect(isValidEmail('user')).toBe(false);
  });

  it('valida contraseñas por longitud mínima', () => {
    expect(isValidPassword('123456')).toBe(true);
    expect(isValidPassword('123')).toBe(false);
  });

  it('valida títulos de tarea no vacíos y con límite de largo', () => {
    expect(isValidTaskTitle('Comprar insumos')).toBe(true);
    expect(isValidTaskTitle('   ')).toBe(false);
    expect(isValidTaskTitle('a'.repeat(121))).toBe(false);
  });

  it('formatea una fecha en formato dd/mm/aaaa', () => {
    const ts = new Date(2026, 0, 15).getTime();
    expect(formatDate(ts)).toMatch(/15\/01\/2026/);
  });
});
