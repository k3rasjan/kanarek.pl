import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormField from '../FormField';

describe('FormField', () => {
  const defaultProps = {
    label: 'Test Label',
    name: 'test',
  };

  it('renders with default props', () => {
    render(<FormField {...defaultProps} />);
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    expect(screen.getByRole('textbox')).toHaveAttribute('required');
  });

  it('renders with custom type', () => {
    render(<FormField {...defaultProps} type="email" />);
    
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
  });

  it('renders with placeholder', () => {
    const placeholder = 'Enter test value';
    render(<FormField {...defaultProps} placeholder={placeholder} />);
    
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });

  it('renders without required attribute when required is false', () => {
    render(<FormField {...defaultProps} required={false} />);
    
    expect(screen.getByRole('textbox')).not.toHaveAttribute('required');
  });

  it('allows user input', async () => {
    render(<FormField {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    await userEvent.type(input, 'test input');
    expect(input).toHaveValue('test input');
  });
}); 