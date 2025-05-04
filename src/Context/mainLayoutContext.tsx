import { createContext, Dispatch, SetStateAction } from 'react';
import { FieldValues, FormState } from 'react-hook-form';

export interface DialogInfoProps {
  dialogTitle: string;
  dialogText: string;
  dialogButtonText: string;
}

interface MainLayoutContextProps {
  toastMessage: string;
  showToastMessage: (error: unknown) => void;
  dialogInfo: DialogInfoProps;
  setDialogInfo: Dispatch<SetStateAction<DialogInfoProps>>;
  dialogHandleButtonAction: () => void;
  setDialogHandleButtonAction: Dispatch<SetStateAction<() => void>>;
  showDialog: boolean;
  setShowDialog: Dispatch<SetStateAction<boolean>>;
  handleFormError: (form: FormState<FieldValues>) => void;
}

export const MainLayoutContext = createContext<MainLayoutContextProps>({
  toastMessage: '',
  showToastMessage: () => {},
  dialogInfo: {
    dialogTitle: '',
    dialogText: '',
    dialogButtonText: '',
  },
  setDialogInfo: () => {},
  dialogHandleButtonAction: () => {},
  setDialogHandleButtonAction: () => {},
  showDialog: false,
  setShowDialog: () => {},
  handleFormError: () => null,
});
