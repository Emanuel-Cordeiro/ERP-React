import { Slide, Snackbar } from '@mui/material';

interface IToastMessageProps {
  message: string;
}

export default function ToastMessage({ message }: IToastMessageProps) {
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      open={message !== ''}
      message={message}
      TransitionComponent={Slide}
      ContentProps={{
        sx: {
          backgroundColor: message.includes('Erro:') ? 'red' : 'green',
          flex: 1,
        },
      }}
    />
  );
}
