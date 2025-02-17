import { NavLink } from 'react-router';

import { Drawer, List, ListItem, ListItemText } from '@mui/material';

import styles from './styles.module.css';

export default function DrawerComponent() {
  const drawerRoutes = [
    {
      routeLink: '/',
      routeTitle: 'Página Inicial',
    },
    {
      routeLink: '/client',
      routeTitle: 'Clientes',
    },
    {
      routeLink: '/orders',
      routeTitle: 'Pedidos',
    },
    {
      routeLink: '/products',
      routeTitle: 'Produtos',
    },
    {
      routeLink: '/recipes',
      routeTitle: 'Receitas',
    },
    {
      routeLink: '/ingredients',
      routeTitle: 'Ingredientes',
    },
  ];

  return (
    <Drawer
      anchor="left"
      variant="persistent"
      open
      sx={{
        '& .MuiDrawer-paper': {
          width: '240px',
          backgroundColor: 'var(--backgroundDrawer)',
          color: 'var(--font)',
          border: 'none',
        },
      }}
    >
      <List>
        {drawerRoutes.map((item) => (
          <NavLink to={item.routeLink} className={styles.navLink} end>
            <ListItem>
              <ListItemText primary={item.routeTitle} />
            </ListItem>
          </NavLink>
        ))}
      </List>
    </Drawer>
  );
}
