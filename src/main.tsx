import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import AppRoutes from './Routes';
import { ThemeProvider } from './Provider/themeProvider';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  </StrictMode>
);
