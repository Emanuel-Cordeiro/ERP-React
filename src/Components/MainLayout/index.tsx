import { Outlet } from 'react-router';

import Header from '../Header';
import DrawerComponent from '../Drawer';
import ToastMessage from '../ToastMessage';
import useMainLayoutContext from '../../Hooks/useMainLayoutContext';
import DialogComponent from '../DialogComponent';

export default function MainLayout() {
  const {
    toastMessage,
    dialogInfo,
    dialogHandleButtonAction,
    showDialog,
    setShowDialog,
  } = useMainLayoutContext();

  return (
    <>
      <Header />
      <DrawerComponent />
      <Outlet />
      <ToastMessage message={toastMessage} />

      <DialogComponent
        title={dialogInfo.dialogTitle}
        text={dialogInfo.dialogText}
        handleButtonAction={dialogHandleButtonAction}
        handleButtonText={dialogInfo.dialogButtonText}
        state={showDialog}
        setState={setShowDialog}
      />
    </>
  );
}
