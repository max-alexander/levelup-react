import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';
import AlertMessage from './AlertMessage';
import Pagination, { pageList } from './Pagination';
import FormField from './FormField';
import ConfirmModal from './ConfirmModal';
import GameImage from './GameImage';

describe('Button (props)', () => {
  it('recibe la etiqueta y ejecuta la función onClick', () => {
    const onClick = jasmine.createSpy('onClick');
    render(<Button label="Comprar" icon="fa-cart-plus" onClick={onClick} />);
    const button = screen.getByRole('button', { name: 'Comprar' });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button.className).toContain('btn-primary');
    expect(button.querySelector('.fa-cart-plus')).not.toBeNull();
  });

  it('aplica variante y no dispara onClick cuando está deshabilitado', () => {
    const onClick = jasmine.createSpy('onClick');
    render(<Button label="Eliminar" variant="danger" size="sm" disabled onClick={onClick} />);
    const button = screen.getByRole('button', { name: 'Eliminar' });
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button.className).toContain('btn-danger btn-sm');
  });
});

describe('AlertMessage (renderizado condicional)', () => {
  it('no renderiza nada cuando no hay error', () => {
    const { container } = render(<AlertMessage message="" />);
    expect(container.innerHTML).toBe('');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('muestra el mensaje solo cuando hay un error y permite cerrarlo', () => {
    const onClose = jasmine.createSpy('onClose');
    render(<AlertMessage message="Correo o contraseña incorrectos." onClose={onClose} />);
    expect(screen.getByRole('alert').textContent).toContain('Correo o contraseña incorrectos.');
    expect(screen.getByRole('alert').className).toContain('alert-danger');
    fireEvent.click(screen.getByLabelText('Cerrar alerta'));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('Pagination', () => {
  it('calcula los números visibles con saltos', () => {
    expect(pageList(1, 3)).toEqual([1, 2, 3]);
    expect(pageList(5, 10)).toEqual([1, 'gap-start', 3, 4, 5, 6, 7, 'gap-end', 10]);
  });

  it('no se muestra con una sola página y notifica el cambio de página', () => {
    const { container, rerender } = render(<Pagination page={1} totalPages={1} onChange={() => {}} />);
    expect(container.innerHTML).toBe('');
    const onChange = jasmine.createSpy('onChange');
    rerender(<Pagination page={2} totalPages={4} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByLabelText('Anterior'));
    expect(onChange.calls.allArgs()).toEqual([[3], [1]]);
    expect(screen.getByRole('button', { name: '2' }).getAttribute('aria-current')).toBe('page');
  });
});

describe('FormField', () => {
  it('asocia label e input, y muestra el error con aria-invalid', () => {
    const onChange = jasmine.createSpy('onChange');
    render(<FormField label="Correo" name="email" value="" onChange={onChange} error="Ingresa un correo válido." required />);
    const input = screen.getByRole('textbox');
    expect(input.id).toBe('field-email');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Ingresa un correo válido.')).toBeTruthy();
    fireEvent.change(input, { target: { value: 'a@b.cl' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('renderiza select y checkbox', () => {
    render(
      <>
        <FormField as="select" label="Rol" name="role" value="admin" onChange={() => {}}><option value="admin">Admin</option></FormField>
        <FormField type="checkbox" label="Acepto" name="terms" value onChange={() => {}} />
      </>
    );
    expect(screen.getByLabelText(/Rol/).value).toBe('admin');
    expect(screen.getByLabelText('Acepto').checked).toBeTrue();
  });
});

describe('ConfirmModal y GameImage', () => {
  it('ConfirmModal se oculta con show=false y ejecuta confirm/cancel', () => {
    const onConfirm = jasmine.createSpy('confirm');
    const onCancel = jasmine.createSpy('cancel');
    const { rerender } = render(<ConfirmModal show={false} message="¿Seguro?" onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    rerender(<ConfirmModal show message="¿Seguro?" confirmLabel="Sí" onConfirm={onConfirm} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sí' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onConfirm).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });

  it('GameImage usa placeholder si no hay imagen o si la imagen falla', () => {
    const { rerender } = render(<GameImage game={{ title: 'Halo', platform: 'Xbox', image: '' }} />);
    expect(screen.getByRole('img', { name: 'Halo' }).className).toContain('ph-xbox');
    rerender(<GameImage game={{ title: 'Halo', platform: 'Xbox', image: 'https://x/roto.jpg' }} />);
    const img = screen.getByRole('img', { name: 'Halo' });
    expect(img.tagName).toBe('IMG');
    fireEvent.error(img);
    expect(screen.getByRole('img', { name: 'Halo' }).tagName).toBe('DIV');
  });
});
