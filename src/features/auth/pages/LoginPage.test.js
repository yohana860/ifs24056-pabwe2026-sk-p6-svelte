import { render, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from './LoginPage.svelte';
import apiHelper from '../../../helpers/apiHelper';
import { navigate } from '../../../router';

vi.mock('../../../router', () => ({ navigate: vi.fn() }));
vi.mock('../../../helpers/apiHelper', () => ({
  default: { post: vi.fn(), putAccessToken: vi.fn() },
}));
vi.mock('../../../helpers/toolsHelper', () => ({ showErrorDialog: vi.fn() }));

describe('LoginPage', () => {
  it('should render form', () => {
    const { getByTestId } = render(LoginPage);
    expect(getByTestId('login-email-input')).toBeInTheDocument();
  });

  it('should handle submit successfully', async () => {
    apiHelper.post.mockResolvedValueOnce({ status: 'success', data: { accessToken: 'token' } });
    const { getByTestId } = render(LoginPage);
    
    // 1. ISI FORM DULU agar validasi HTML5 tidak memblokir submit
    await fireEvent.input(getByTestId('login-email-input'), { target: { value: 'test@delcom.org' } });
    await fireEvent.input(getByTestId('login-password-input'), { target: { value: 'password123' } });
    
    // 2. Baru klik submit
    await fireEvent.click(getByTestId('login-submit-button'));
    
    await waitFor(() => {
      expect(apiHelper.putAccessToken).toHaveBeenCalledWith('token');
      expect(navigate).toHaveBeenCalledWith('/', expect.any(Object));
    });
  });

  it('should fail if status is not success', async () => {
    apiHelper.post.mockResolvedValueOnce({ status: 'fail', message: 'Wrong pass' });
    const { getByTestId } = render(LoginPage);
    
    await fireEvent.input(getByTestId('login-email-input'), { target: { value: 'a@a.com' } });
    await fireEvent.input(getByTestId('login-password-input'), { target: { value: '1' } });
    await fireEvent.click(getByTestId('login-submit-button'));
    
    await waitFor(() => {
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  it('should fail if token is missing', async () => {
    apiHelper.post.mockResolvedValueOnce({ status: 'success', data: {} });
    const { getByTestId } = render(LoginPage);
    
    await fireEvent.input(getByTestId('login-email-input'), { target: { value: 'a@a.com' } });
    await fireEvent.input(getByTestId('login-password-input'), { target: { value: '1' } });
    await fireEvent.click(getByTestId('login-submit-button'));
    
    await waitFor(() => {
      expect(apiHelper.putAccessToken).not.toHaveBeenCalled();
    });
  });

  it('should catch network error', async () => {
    apiHelper.post.mockRejectedValueOnce(new Error('Network error'));
    const { getByTestId } = render(LoginPage);
    
    await fireEvent.input(getByTestId('login-email-input'), { target: { value: 'a@a.com' } });
    await fireEvent.input(getByTestId('login-password-input'), { target: { value: '1' } });
    await fireEvent.click(getByTestId('login-submit-button'));
    
    await waitFor(() => {
      expect(navigate).not.toHaveBeenCalled();
    });
  });
});