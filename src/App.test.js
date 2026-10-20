import { render } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App.svelte';
import { currentPath } from './router';

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/');
  });

  it('should render all routes to cover all branches', async () => {
    // 1. Login
    currentPath.set('/auth/login');
    let view = render(App);
    await new Promise((r) => setTimeout(r, 100));
    expect(view.getByText('Masuk')).toBeInTheDocument();
    view.unmount();

    // 2. Register
    currentPath.set('/auth/register');
    view = render(App);
    await new Promise((r) => setTimeout(r, 100));
    expect(view.getByText('Daftar')).toBeInTheDocument();
    view.unmount();

    // 3. Home
    currentPath.set('/');
    view = render(App);
    await new Promise((r) => setTimeout(r, 100));
    expect(view.getByText('Memuat sesi pengguna...')).toBeInTheDocument();
    view.unmount();

    // 4. Detail
    currentPath.set('/link-trees/1');
    view = render(App);
    await new Promise((r) => setTimeout(r, 100));
    expect(view.getByText('Memuat sesi pengguna...')).toBeInTheDocument();
    view.unmount();

    // 5. Users
    currentPath.set('/users');
    view = render(App);
    await new Promise((r) => setTimeout(r, 100));
    expect(view.getByText('Memuat sesi pengguna...')).toBeInTheDocument();
    view.unmount();

    // 6. Profile
    currentPath.set('/profile');
    view = render(App);
    await new Promise((r) => setTimeout(r, 100));
    expect(view.getByText('Memuat sesi pengguna...')).toBeInTheDocument();
    view.unmount();

    // 7. Not Found
    currentPath.set('/invalid-route');
    view = render(App);
    await new Promise((r) => setTimeout(r, 100));
    expect(view.getByText('Halaman tidak ditemukan.')).toBeInTheDocument();
    view.unmount();
  });
});