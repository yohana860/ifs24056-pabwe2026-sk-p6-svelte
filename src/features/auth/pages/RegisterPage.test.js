import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import RegisterPage from './RegisterPage.svelte';
import apiHelper from '../../../helpers/apiHelper';
import { navigate } from '../../../router';

vi.mock('../../../router', () => ({
  navigate: vi.fn(),
}));

vi.mock('../../../helpers/apiHelper', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('RegisterPage', () => {
  it('should render form fields', () => {
    const { getByTestId } = render(RegisterPage);
    expect(getByTestId('register-name-input')).toBeInTheDocument();
    expect(getByTestId('register-submit-button')).toBeInTheDocument();
  });

  it('should submit form successfully and navigate', async () => {
    apiHelper.post.mockResolvedValueOnce({ status: 'success' });
    
    const { getByTestId } = render(RegisterPage);
    
    await fireEvent.input(getByTestId('register-name-input'), { target: { value: 'User' } });
    await fireEvent.input(getByTestId('register-email-input'), { target: { value: 'user@test.com' } });
    await fireEvent.input(getByTestId('register-password-input'), { target: { value: 'password123' } });
    await fireEvent.input(getByTestId('register-confirm-password-input'), { target: { value: 'password123' } });
    
    await fireEvent.click(getByTestId('register-submit-button'));
    
    expect(apiHelper.post).toHaveBeenCalled();
    // Tunggu proses async
    await new Promise(r => setTimeout(r, 0));
    expect(navigate).toHaveBeenCalledWith('/auth/login');
  });
});