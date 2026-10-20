import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiHelper from './apiHelper';

describe('apiHelper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    localStorage.clear();
  });

  it('should get and put access token', () => {
    apiHelper.putAccessToken('test');
    expect(apiHelper.getAccessToken()).toBe('test');
    apiHelper.putAccessToken(null);
    expect(apiHelper.getAccessToken()).toBeNull();
  });

  it('should handle URL dengan trailing slash', async () => {
    global.fetch.mockResolvedValue({ json: () => Promise.resolve({}) });
    
    // Menutupi baris 34
    await apiHelper.fetchData('/users/');
    expect(global.fetch).toHaveBeenCalledWith(
      "https://open-api.delcom.org/api/v1/users",
      expect.any(Object)
    );
  });

  it('should handle all HTTP methods and FormData', async () => {
    global.fetch.mockResolvedValue({ json: () => Promise.resolve({ status: 'ok' }) });
    
    await apiHelper.get('/get');
    await apiHelper.post('/post', { a: 1 });
    await apiHelper.put('/put', { a: 1 });
    await apiHelper.delete('/delete');
    
    const fd = new FormData();
    await apiHelper.postMultipart('/upload', fd);
    await apiHelper.putMultipart('/upload', fd);
    
    expect(global.fetch).toHaveBeenCalled();
  });
});