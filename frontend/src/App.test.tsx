import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import { store } from './store';

// Mock the i18n module
vi.mock('./i18n', () => ({}));

// Mock the CSS import
vi.mock('./index.css', () => ({}));

// Mock the useI18nReady hook
vi.mock('./hooks/useI18nReady', () => ({
  useI18nReady: () => ({
    isReady: true,
    isLoading: false,
  }),
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <HelmetProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </HelmetProvider>
    );

    // Just check that the app renders without throwing
    expect(document.querySelector('#root')).toBeTruthy();
  });

  it('renders the app component', () => {
    const { container } = render(
      <HelmetProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </HelmetProvider>
    );

    expect(container).toBeTruthy();
  });
});
