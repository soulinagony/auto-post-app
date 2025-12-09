import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputSection } from './InputSection';
import { vi } from 'vitest';

describe('InputSection', () => {
  const mockOnFetchArticle = vi.fn();
  const mockOnGeneratePost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <InputSection
        onFetchArticle={mockOnFetchArticle}
        onGeneratePost={mockOnGeneratePost}
      />
    );
  });

  it('renders the component with heading', () => {
    expect(screen.getByText('Источник Контента')).toBeInTheDocument();
  });

  it('should have the load button disabled initially', () => {
    expect(screen.getByRole('button', { name: /Загрузить/i })).toBeDisabled();
  });

  it('should have the generate post button disabled initially', () => {
    expect(screen.getByRole('button', { name: /Сгенерировать Пост/i })).toBeDisabled();
  });

  it('should enable the load button when text is entered into the url input', async () => {
    const urlInput = screen.getByPlaceholderText('https://example.com/article');
    await userEvent.type(urlInput, 'https://test.com');
    expect(screen.getByRole('button', { name: /Загрузить/i })).toBeEnabled();
  });

  it('should call onFetchArticle when the form is submitted', async () => {
    const urlInput = screen.getByPlaceholderText('https://example.com/article');
    await userEvent.type(urlInput, 'https://test.com');
    
    const loadButton = screen.getByRole('button', { name: /Загрузить/i });
    await userEvent.click(loadButton);

    expect(mockOnFetchArticle).toHaveBeenCalledWith('https://test.com');
  });
});
