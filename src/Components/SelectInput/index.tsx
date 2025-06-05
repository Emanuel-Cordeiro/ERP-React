import { MenuItem, TextField } from '@mui/material';

interface SelectInputProps {
  id: string;
  label: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined' | 'standard';
  value: string | undefined;
  setValue: (value: unknown) => void;
  width: number;
}

export function SelectInput({
  value,
  setValue,
  width,
  id,
  label,
  disabled = false,
  size = 'small',
  variant = 'outlined',
}: SelectInputProps) {
  const units = ['UN', 'KG', 'CT', 'LT', 'ML', 'GR', 'DZ'];

  return (
    <TextField
      id={id}
      select
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
        select: {
          MenuProps: {
            PaperProps: {
              sx: {
                backgroundColor: 'var(--backgroundInput)',
                color: 'var(--font)',
              },
            },
          },
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
        '& .MuiSelect-select': {
          color: 'var(--font)', // selected value text color
        },
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
    >
      {units.map((unit) => (
        <MenuItem
          value={unit}
          key={unit}
          sx={{
            color: 'var(--font)',
            backgroundColor: 'var(--backgroundInput)',
          }}
        >
          {unit}
        </MenuItem>
      ))}
    </TextField>
  );
}
