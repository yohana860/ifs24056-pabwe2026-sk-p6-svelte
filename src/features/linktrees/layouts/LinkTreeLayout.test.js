import { render, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LinkTreeLayout from './LinkTreeLayout.svelte';
import { usersStore } from '../../users/states/usersStore';
import { authStore } from '../../auth/states/authStore';
import apiHelper from '../../../helpers/apiHelper';

vi.mock('../../../router', async () => {
  const { writable } = await import('svelte/store');
  return {
    navigate: vi.fn(),
    currentPath: writable('/'),
    goto: vi.fn(),
    back: vi.fn(),
  };
});

import { navigate } from '../../../router';

vi.mock('../../../helpers/apiHelper', () => ({
  default: {
    getAccessToken: vi.fn(),
    putAccessToken: vi.fn(),
  },
}));

describe('LinkTreeLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersStore.reset();
    authStore.reset();
  });

  it('should show loading state if access token does not exist', () => {
    apiHelper.getAccessToken.mockReturnValue(null);
    
    // Render komponen
    const { getByText } = render(LinkTreeLayout);
    
    // Cek apakah loading spinner muncul (sesuai perilaku aslimu)
    expect(getByText('Memuat sesi pengguna...')).toBeInTheDocument();
    
    // Pastikan navigate TIDAK dipanggil langsung di layout ini
    expect(navigate).not.toHaveBeenCalled();
  });

  it('should call asyncSetProfile when a token exists', async () => {
    apiHelper.getAccessToken.mockReturnValue('mock-token');
    const spy = vi.spyOn(usersStore, 'asyncSetProfile').mockImplementation(() => {});
    
    render(LinkTreeLayout);
    
    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
  });

  it('should render navbar, sidebar, and profile when profile exists', async () => {
    apiHelper.getAccessToken.mockReturnValue('mock-token');
    
    const { getByText } = render(LinkTreeLayout);
    
    usersStore.setProfile({ name: 'Test User', email: 'test@test.com' });
    
    await waitFor(() => {
      expect(getByText('Test User')).toBeInTheDocument();
    });
  });

  it('should handle logout correctly', async () => {
    apiHelper.getAccessToken.mockReturnValue('mock-token');
    render(LinkTreeLayout);
    
    usersStore.setProfile({ name: 'Test User', email: 'test@test.com' });
    
    // Trigger logout
    authStore.setIsAuthLogout(true);
    
    await waitFor(() => {
      // Navigate ke login dipanggil oleh LinkTreeLayout saat logout
      expect(navigate).toHaveBeenCalledWith('/auth/login');
    });
  });
});