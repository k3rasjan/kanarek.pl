import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from '../Register';

describe('Register', () => {
  it('renders registration form with all required elements', () => {
    render(<Register />);
    
    expect(screen.getByText('UTWÓRZ KONTO')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nazwa użytkownika/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Hasło$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Powtórz hasło/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('STWÓRZ KONTO');
    expect(screen.getByText(/Posiadasz już konto\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Zaloguj się/i)).toBeInTheDocument();
  });

  it('allows user to input registration details', async () => {
    render(<Register />);
    
    const usernameInput = screen.getByLabelText(/Nazwa użytkownika/i);
    const emailInput = screen.getByLabelText(/E-mail/i);
    const passwordInput = screen.getByLabelText(/^Hasło$/i);
    const confirmPasswordInput = screen.getByLabelText(/Powtórz hasło/i);
    
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
    
    expect(usernameInput).toHaveValue('testuser');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
    expect(confirmPasswordInput).toHaveValue('password123');
  });

  it('has required fields', () => {
    render(<Register />);
    
    const usernameInput = screen.getByLabelText(/Nazwa użytkownika/i);
    const emailInput = screen.getByLabelText(/E-mail/i);
    const passwordInput = screen.getByLabelText(/^Hasło$/i);
    const confirmPasswordInput = screen.getByLabelText(/Powtórz hasło/i);
    
    expect(usernameInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
    expect(confirmPasswordInput).toHaveAttribute('required');
  });

  it('has correct input types', () => {
    render(<Register />);
    
    const usernameInput = screen.getByLabelText(/Nazwa użytkownika/i);
    const emailInput = screen.getByLabelText(/E-mail/i);
    const passwordInput = screen.getByLabelText(/^Hasło$/i);
    const confirmPasswordInput = screen.getByLabelText(/Powtórz hasło/i);
    
    expect(usernameInput).toHaveAttribute('type', 'text');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  it('has correct placeholders', () => {
    render(<Register />);
    
    const usernameInput = screen.getByLabelText(/Nazwa użytkownika/i);
    const emailInput = screen.getByLabelText(/E-mail/i);
    const passwordInput = screen.getByLabelText(/^Hasło$/i);
    const confirmPasswordInput = screen.getByLabelText(/Powtórz hasło/i);
    
    expect(usernameInput).toHaveAttribute('placeholder', 'Wprowadź nazwę użytkownika');
    expect(emailInput).toHaveAttribute('placeholder', 'Wprowadź swój e-mail');
    expect(passwordInput).toHaveAttribute('placeholder', 'Wprowadź swoje hasło');
    expect(confirmPasswordInput).toHaveAttribute('placeholder', 'Powtórz hasło');
  });
}); 