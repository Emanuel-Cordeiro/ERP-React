import { createContext, Dispatch, SetStateAction } from 'react';

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
});
