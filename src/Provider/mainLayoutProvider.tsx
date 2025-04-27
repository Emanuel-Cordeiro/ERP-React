import { useState } from 'react';
import {
  DialogInfoProps,
  MainLayoutContext,
} from '../Context/mainLayoutContext';
import { ChildrenProps } from '../Types/common';

export default function MainLayoutProvider({ children }: ChildrenProps) {
  const [toastMessage, setToastMessage] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [dialogInfo, setDialogInfo] = useState<DialogInfoProps>({
    dialogTitle: '',
    dialogText: '',
    dialogButtonText: '',
  });
  const [dialogHandleButtonAction, setDialogHandleButtonAction] = useState<
    () => void
  >(() => () => {});

  const showToastMessage = (error: unknown) => {
    const msg = error instanceof Error ? error.message : String(error);

    setToastMessage(msg);

    setTimeout(() => setToastMessage(''), 5000);
  };

  return (
    <MainLayoutContext.Provider
      value={{
        toastMessage,
        showToastMessage,
        dialogInfo,
        setDialogInfo,
        dialogHandleButtonAction,
        setDialogHandleButtonAction,
        showDialog,
        setShowDialog,
      }}
    >
      {children}
    </MainLayoutContext.Provider>
  );
}
