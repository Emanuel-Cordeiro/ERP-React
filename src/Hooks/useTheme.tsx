import { useContext } from 'react';

import { ThemeContext } from '../Context/themeContext';

export function useTheme() {
  return useContext(ThemeContext);
}
