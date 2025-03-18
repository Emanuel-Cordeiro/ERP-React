import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface IDialogProps {
  title: string;
  text: string;
  state: boolean;
  setState: (param: boolean) => void;
  handleButtonText: string;
  handleButtonAction: () => void;
  cancelButtonText?: string;
}

export default function DialogComponent({
  title,
  text,
  state,
  setState,
  handleButtonText,
  handleButtonAction,
  cancelButtonText = 'Não',
}: IDialogProps) {
  return (
    <Dialog open={state}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{text}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setState(false)}>{cancelButtonText}</Button>
        <Button onClick={handleButtonAction} autoFocus>
          {handleButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
