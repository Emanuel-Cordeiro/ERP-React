import { Button } from '@mui/material';

interface ButtonFormProps {
  title: string;
  handleFunction: (() => void) | ((e: React.BaseSyntheticEvent) => void);
  width?: number;
  loading?: boolean;
}
export default function ButtonForm({
  title,
  handleFunction,
  width = 100,
  loading = false,
}: ButtonFormProps) {
  return (
    <Button
      onClick={handleFunction}
      sx={{ marginRight: 2, textTransform: 'none', width: width }}
      variant="contained"
      loading={loading}
    >
      {title}
    </Button>
  );
}
