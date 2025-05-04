import { useState } from 'react';

import { FieldValues, FormState } from 'react-hook-form';

import { ChildrenProps } from '../Types/common';
import {
  DialogInfoProps,
  MainLayoutContext,
} from '../Context/mainLayoutContext';

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

  function handleFormError(formState: FormState<FieldValues>) {
    const error = Object.values(formState.errors)[0];

    showToastMessage('Erro: ' + String(error!.message));
  }

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
        handleFormError,
      }}
    >
      {children}
    </MainLayoutContext.Provider>
  );
}
