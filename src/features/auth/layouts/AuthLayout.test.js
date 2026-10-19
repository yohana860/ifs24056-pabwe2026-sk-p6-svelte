import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import AuthLayout from './AuthLayout.svelte';

describe('AuthLayout', () => {
  it('should render branding', () => {
    const { getByText } = render(AuthLayout);
    // Sesuaikan dengan teks yang ada di AuthLayout.svelte kamu
    expect(getByText('Delcom Link Tree')).toBeInTheDocument();
    expect(getByText(/Kumpulkan dan bagikan semua tautan/i)).toBeInTheDocument();
  });
});