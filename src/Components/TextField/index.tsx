import { TextField } from '@mui/material';

interface InputProps {
  id: string;
  label: string;
  width: number;
  value: string | number | undefined;
  setValue: (value: unknown) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined' | 'standard';
}

export default function Input({
  id,
  label,
  width,
  value,
  setValue,
  disabled = false,
  size = 'small',
  variant = 'outlined',
}: InputProps) {
  return (
    <TextField
      id={id}
      label={label}
      variant={variant}
      size={size}
      required
      disabled={disabled}
      value={value}
      focused
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
      }}
      slotProps={{
        inputLabel: {
          shrink: true,
        },
      }}
      sx={{
        width,
        backgroundColor: 'var(--backgroundInput)',
        borderRadius: '8px',
        marginRight: '15px',
        marginBottom: '20px',
        input: { color: 'var(--font) !important' },
        label: { color: 'var(--font) !important' },
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: 'var(--font)' },
          '&:hover fieldset': { borderColor: 'var(--font)' },
          '&.Mui-focused fieldset': { borderColor: 'var(--font)' },
          '&.Mui-disabled': {
            '& fieldset': { borderColor: 'var(--font) !important' },
          },
        },
        '& .MuiInputBase-input.Mui-disabled': {
          WebkitTextFillColor: 'var(--font) !important',
        },
      }}
    />
  );
}
