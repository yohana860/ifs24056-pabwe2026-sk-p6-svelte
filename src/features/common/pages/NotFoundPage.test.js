import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import NotFoundPage from './NotFoundPage.svelte';
import { navigate } from '../../../router';

vi.mock('../../../router', () => ({
  navigate: vi.fn(),
}));

describe('NotFoundPage', () => {
  it('should render 404 text and description properly', () => {
    const { getByText } = render(NotFoundPage);
    expect(getByText('404')).toBeInTheDocument();
    expect(getByText('Halaman tidak ditemukan.')).toBeInTheDocument();
  });

  it('should navigate to home when Kembali ke Beranda button is clicked', async () => {
    const { getByText } = render(NotFoundPage);
    // Sesuaikan dengan teks tombol yang baru
    const homeButton = getByText('Kembali ke Beranda');
    await fireEvent.click(homeButton);
    expect(navigate).toHaveBeenCalledWith('/');
  });
});