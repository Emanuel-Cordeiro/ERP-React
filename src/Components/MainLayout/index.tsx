import { Outlet } from 'react-router';

import Header from '../Header';
import DrawerComponent from '../Drawer';

export default function MainLayout() {
  return (
    <>
      <Header />
      <DrawerComponent />
      <Outlet />
    </>
  );
}
