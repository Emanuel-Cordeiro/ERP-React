import { useState, useEffect } from 'react';
import { ChildrenProps } from '../Types/common';
import { ThemeContext } from '../Context/themeContext';

export function ThemeProvider({ children }: ChildrenProps) {
  const [applicationTheme, setApplicationTheme] = useState<'light' | 'dark'>(
    'light'
  );

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setApplicationTheme('dark');
      document.querySelector('body')?.setAttribute('data-theme', 'dark');
    } else {
      setApplicationTheme('light');
      document.querySelector('body')?.setAttribute('data-theme', 'light');
    }
  }, []);

  const switchApplicationTheme = () => {
    setApplicationTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';

      document.querySelector('body')?.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);

      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ applicationTheme, switchApplicationTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
