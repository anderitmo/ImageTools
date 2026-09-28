import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from './App';

describe('App UI components and interactions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders header and initial upload dropzone', () => {
    render(<App />);
    expect(screen.getByText('ImageTools')).toBeDefined();
    expect(screen.getByText('Arraste e solte suas imagens aqui')).toBeDefined();
  });

  it('toggles dark/light theme when button is clicked', () => {
    render(<App />);
    const toggleButton = screen.getByLabelText('Alternar tema');
    expect(toggleButton).toBeDefined();

    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
