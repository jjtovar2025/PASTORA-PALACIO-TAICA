import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global Error:", message, error);
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("No se encontró el elemento root");

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
