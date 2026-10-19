import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from './LoginPage.svelte';
import apiHelper from '../../../helpers/apiHelper';
import { navigate } from '../../../router';

vi.mock('../../../router', () => ({
  navigate: vi.fn(),
}));

vi.mock('../../../helpers/apiHelper', () => ({
  default: {
    post: vi.fn(),
    putAccessToken: vi.fn(),
  },
}));

describe('LoginPage', () => {
  it('should render form fields', () => {
    const { getByTestId } = render(LoginPage);
    expect(getByTestId('login-email-input')).toBeInTheDocument();
    expect(getByTestId('login-submit-button')).toBeInTheDocument();
  });

  it('should handle submit and navigate to home', async () => {
    apiHelper.post.mockResolvedValueOnce({ 
      status: 'success', 
      data: { accessToken: 'mock-token' } 
    });
    
    const { getByTestId } = render(LoginPage);
    
    await fireEvent.input(getByTestId('login-email-input'), { target: { value: 'test@test.com' } });
    await fireEvent.input(getByTestId('login-password-input'), { target: { value: 'password123' } });
    
    await fireEvent.click(getByTestId('login-submit-button'));
    
    expect(apiHelper.post).toHaveBeenCalledWith('/auth/login', expect.any(Object));
    expect(apiHelper.putAccessToken).toHaveBeenCalledWith('mock-token');
    
    await new Promise(r => setTimeout(r, 0));
    // Perbaikan: Tambahkan expect.any(Object) karena ada parameter { replace: true }
    expect(navigate).toHaveBeenCalledWith('/', expect.any(Object));
  });
});