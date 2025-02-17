import { Switch } from '@mui/material';

import styles from './styles.module.css';
import { useTheme } from '../../Hooks/useTheme';

export default function Header() {
  const { switchApplicationTheme, applicationTheme } = useTheme();

  return (
    <div className={styles.containerComponents}>
      <header className={styles.headerTitle}>Controle Empresarial</header>
      <Switch
        checked={applicationTheme === 'dark'}
        onClick={() => switchApplicationTheme()}
        defaultChecked
      />
    </div>
  );
}
