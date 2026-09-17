import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app';
import 'material-design-lite/dist/material.red-orange.min.css';
import 'material-design-lite/material.min.js';
import '@/app/styles/app.css';
import '@/app/styles/dynamicClasses.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
