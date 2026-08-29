import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n/config';
import './index.css';
import App from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
