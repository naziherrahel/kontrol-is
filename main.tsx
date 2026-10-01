import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CatalogueApp from './components/catalog-app';
import './app/globals.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Не найден корневой элемент приложения.');
}

createRoot(root).render(
  <StrictMode>
    <CatalogueApp />
  </StrictMode>,
);
