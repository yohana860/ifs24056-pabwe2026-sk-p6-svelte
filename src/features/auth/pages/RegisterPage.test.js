import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterPage from './RegisterPage.svelte';
import apiHelper from '../../../helpers/apiHelper';
import { navigate } from '../../../router';
import { showErrorDialog } from '../../../helpers/toolsHelper';

vi.mock('../../../router', () => ({ navigate: vi.fn() }));
vi.mock('../../../helpers/apiHelper', () => ({ default: { post: vi.fn() } }));
vi.mock('../../../helpers/toolsHelper', () => ({ showErrorDialog: vi.fn() }));

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form', () => {
    const { getByTestId } = render(RegisterPage);
    expect(getByTestId('register-name-input')).toBeInTheDocument();
  });

  it('should fail if passwords do not match', async () => {
    const { getByTestId } = render(RegisterPage);
    
    await fireEvent.input(getByTestId('register-name-input'), { target: { value: 'User' } });
    await fireEvent.input(getByTestId('register-email-input'), { target: { value: 'a@a.com' } });
    await fireEvent.input(getByTestId('register-password-input'), { target: { value: '123456' } });
    await fireEvent.input(getByTestId('register-confirm-password-input'), { target: { value: '654321' } });
    
    await fireEvent.click(getByTestId('register-submit-button'));
    await new Promise(r => setTimeout(r, 50));

    expect(apiHelper.post).not.toHaveBeenCalled();
    expect(showErrorDialog).toHaveBeenCalledWith("Konfirmasi password tidak cocok");
  });

  it('should register successfully', async () => {
    apiHelper.post.mockResolvedValueOnce({ status: 'success' });
    const { getByTestId } = render(RegisterPage);
    
    await fireEvent.input(getByTestId('register-name-input'), { target: { value: 'User' } });
    await fireEvent.input(getByTestId('register-email-input'), { target: { value: 'a@a.com' } });
    await fireEvent.input(getByTestId('register-password-input'), { target: { value: '123456' } });
    await fireEvent.input(getByTestId('register-confirm-password-input'), { target: { value: '123456' } });
    
    await fireEvent.click(getByTestId('register-submit-button'));
    await new Promise(r => setTimeout(r, 50));
    expect(navigate).toHaveBeenCalledWith('/auth/login');
  });

  it('should fail if API returns fail status', async () => {
    apiHelper.post.mockResolvedValueOnce({ status: 'fail', message: 'Email sudah dipakai' });
    const { getByTestId } = render(RegisterPage);
    
    await fireEvent.input(getByTestId('register-name-input'), { target: { value: 'User' } });
    await fireEvent.input(getByTestId('register-email-input'), { target: { value: 'a@a.com' } });
    await fireEvent.input(getByTestId('register-password-input'), { target: { value: '123456' } });
    await fireEvent.input(getByTestId('register-confirm-password-input'), { target: { value: '123456' } });
    
    await fireEvent.click(getByTestId('register-submit-button'));
    await new Promise(r => setTimeout(r, 50));
    expect(navigate).not.toHaveBeenCalled();
    expect(showErrorDialog).toHaveBeenCalledWith('Email sudah dipakai');
  });

  it('should catch network error', async () => {
    apiHelper.post.mockRejectedValueOnce(new Error('Network Error'));
    const { getByTestId } = render(RegisterPage);
    
    await fireEvent.input(getByTestId('register-name-input'), { target: { value: 'User' } });
    await fireEvent.input(getByTestId('register-email-input'), { target: { value: 'a@a.com' } });
    await fireEvent.input(getByTestId('register-password-input'), { target: { value: '123456' } });
    await fireEvent.input(getByTestId('register-confirm-password-input'), { target: { value: '123456' } });
    
    await fireEvent.click(getByTestId('register-submit-button'));
    await new Promise(r => setTimeout(r, 50));
    expect(navigate).not.toHaveBeenCalled();
    expect(showErrorDialog).toHaveBeenCalledWith('Network Error');
  });
});