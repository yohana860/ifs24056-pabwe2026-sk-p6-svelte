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

  it('should handle absolute and relative URLs', async () => {
    global.fetch.mockResolvedValue({ json: () => Promise.resolve({}) });
    
    // Test URL relative
    await apiHelper.fetchData('/users/?page=1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users?page=1'),
      expect.any(Object)
    );

    // Test URL absolute
    await apiHelper.fetchData('https://custom.com/api/');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://custom.com/api',
      expect.any(Object)
    );
  });

  it('should attach Authorization header if token exists', async () => {
    apiHelper.putAccessToken('my-token');
    global.fetch.mockResolvedValueOnce({ json: () => Promise.resolve({}) });
    
    await apiHelper.fetchData('/test');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' })
      })
    );
  });

  it('should handle all HTTP methods with JSON body', async () => {
    global.fetch.mockResolvedValue({ json: () => Promise.resolve({ status: 'ok' }) });
    
    await apiHelper.post('/post', { a: 1 });
    expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: 'POST' }));

    await apiHelper.put('/put', { a: 1 });
    expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: 'PUT' }));

    await apiHelper.delete('/delete');
    expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: 'DELETE' }));
  });

  it('should handle FormData for multipart', async () => {
    global.fetch.mockResolvedValue({ json: () => Promise.resolve({}) });
    const fd = new FormData();
    
    await apiHelper.postMultipart('/upload', fd);
    expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ body: fd }));
    
    await apiHelper.putMultipart('/upload', fd);
    expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ body: fd }));
  });
});