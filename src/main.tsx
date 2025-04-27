import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import AppRoutes from './Routes';
import { ThemeProvider } from './Provider/themeProvider';

import './index.css';
import MainLayoutProvider from './Provider/mainLayoutProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <MainLayoutProvider>
        <AppRoutes />
      </MainLayoutProvider>
    </ThemeProvider>
  </StrictMode>
);
