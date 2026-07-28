import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '@/components/TaskForm';

describe('TaskForm', () => {
  it('no llama a onSubmit si el título está vacío', async () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: /agregar tarea/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/título es obligatorio/i);
  });

  it('llama a onSubmit con los datos del formulario y limpia los campos', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/título/i), 'Comprar insumos');
    await userEvent.type(screen.getByLabelText(/descripción/i), 'Para la oficina');
    await userEvent.click(screen.getByRole('button', { name: /agregar tarea/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Comprar insumos',
      description: 'Para la oficina',
    });
  });

  it('precarga los valores iniciales cuando se edita', () => {
    render(
      <TaskForm
        onSubmit={vi.fn()}
        initialValues={{ title: 'Tarea existente', description: 'Desc' }}
        submitLabel="Guardar cambios"
      />,
    );

    expect(screen.getByLabelText(/título/i)).toHaveValue('Tarea existente');
    expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument();
  });
});
