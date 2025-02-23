import { Button } from '@mui/material';

interface ButtonFormProps {
  title: string;
  handleFunction: (() => void) | ((e: React.BaseSyntheticEvent) => void);
  width?: number;
}
export default function ButtonForm({
  title,
  handleFunction,
  width = 100,
}: ButtonFormProps) {
  return (
    <Button
      onClick={handleFunction}
      sx={{ marginRight: 2, textTransform: 'none', width: width }}
      variant="contained"
    >
      {title}
    </Button>
  );
}
