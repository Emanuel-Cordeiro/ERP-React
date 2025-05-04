import { Autocomplete, TextField } from '@mui/material';
import api from '../../Services/api';
import { useEffect, useState } from 'react';
import { ClientProps } from '../../Pages/Clients';

interface ISearchComponent {
  id: string;
  label: string;
  width: number;
  disabled: boolean;
  value: string | undefined;
  setValue: (value: unknown) => void;
}

export default function SearchComponent({
  id,
  label,
  width,
  value,
  setValue,
  disabled,
}: ISearchComponent) {
  const [options, setOptions] = useState<Array<string>>([]);

  useEffect(() => {
    async function fetchClients() {
      try {
        const { data } = await api.get('Cliente');

        const names = data.map(
          (client: ClientProps) => client.client_id + ' - ' + client.name
        );

        setOptions(names);
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
      }
    }

    fetchClients();
  }, []);

  return (
    <Autocomplete
      freeSolo
      disableClearable
      id={id}
      disabled={disabled}
      options={options}
      value={value ?? ''}
      onInputChange={(_, newInputValue) => {
        setValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label={label}
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
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />
      )}
    />
  );
}
