import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../Login';

describe('Login', () => {
  it('renders login form with all required elements', () => {
    render(<Login />);
    
    expect(screen.getByText('WITAMY NA KANAREK.PL')).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hasło/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Zaloguj');
    expect(screen.getByText(/Nie pamiętasz hasła\?/i)).toBeInTheDocument();
  });

  it('allows user to input email and password', async () => {
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/E-mail/i);
    const passwordInput = screen.getByLabelText(/Hasło/i);
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('has required fields', () => {
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/E-mail/i);
    const passwordInput = screen.getByLabelText(/Hasło/i);
    
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
  });

  it('has correct input types', () => {
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/E-mail/i);
    const passwordInput = screen.getByLabelText(/Hasło/i);
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('has correct placeholders', () => {
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/E-mail/i);
    const passwordInput = screen.getByLabelText(/Hasło/i);
    
    expect(emailInput).toHaveAttribute('placeholder', 'Wprowadź swój e-mail');
    expect(passwordInput).toHaveAttribute('placeholder', 'Wprowadź swoje hasło');
  });

  it('has checkbox checked by default', () => {
    render(<Login />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });
}); 