import { createContext } from 'react';

interface ThemeContextProps {
  applicationTheme: string;
  switchApplicationTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  applicationTheme: 'light',
  switchApplicationTheme: () => {},
});
