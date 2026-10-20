import { render } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App.svelte';
import { currentPath } from './router';

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/');
  });

  it('should render without crashing', async () => {
    const { container } = render(App);
    await new Promise((r) => setTimeout(r, 50));
    expect(container).toBeTruthy();
  });
});