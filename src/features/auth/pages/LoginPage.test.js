import { render, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage.svelte';
import apiHelper from '../../../helpers/apiHelper';
import { navigate } from '../../../router';
import { showErrorDialog } from '../../../helpers/toolsHelper';

vi.mock('../../../router', () => ({ navigate: vi.fn() }));
vi.mock('../../../helpers/apiHelper', () => ({
  default: { post: vi.fn(), putAccessToken: vi.fn() },
}));
vi.mock('../../../helpers/toolsHelper', () => ({ showErrorDialog: vi.fn() }));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form', () => {
    const { getByTestId } = render(LoginPage);
    expect(getByTestId('login-email-input')).toBeInTheDocument();
  });

  it('should handle submit successfully', async () => {
    apiHelper.post.mockResolvedValueOnce({ status: 'success', data: { accessToken: 'token' } });
    const { getByTestId } = render(LoginPage);
    
    await fireEvent.input(getByTestId('login-email-input'), { target: { value: 'a@a.com' } });
    await fireEvent.input(getByTestId('login-password-input'), { target: { value: '123' } });
    
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
    await fireEvent.input(getByTestId('login-password-input'), { target: { value: '123' } });
    await fireEvent.click(getByTestId('login-submit-button'));
    
    await waitFor(() => {
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  it('should fail if token is missing', async () => {
    apiHelper.post.mockResolvedValueOnce({ status: 'success', data: {} });
    const { getByTestId } = render(LoginPage);
    
    await fireEvent.input(getByTestId('login-email-input'), { target: { value: 'a@a.com' } });
    await fireEvent.input(getByTestId('login-password-input'), { target: { value: '123' } });
    await fireEvent.click(getByTestId('login-submit-button'));
    
    await waitFor(() => {
      expect(apiHelper.putAccessToken).not.toHaveBeenCalled();
    });
  });

  it('should catch network error', async () => {
    apiHelper.post.mockRejectedValueOnce(new Error('Network error'));
    const { getByTestId } = render(LoginPage);
    
    await fireEvent.input(getByTestId('login-email-input'), { target: { value: 'a@a.com' } });
    await fireEvent.input(getByTestId('login-password-input'), { target: { value: '123' } });
    await fireEvent.click(getByTestId('login-submit-button'));
    
    await waitFor(() => {
      expect(navigate).not.toHaveBeenCalled();
    });
  });
});