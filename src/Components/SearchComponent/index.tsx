import { useEffect, useState } from 'react';

import { Autocomplete, TextField } from '@mui/material';

import api from '../../Services/api';
import { ClientProps } from '../../Pages/Clients';
import { RecipeProps } from '../../Pages/Recipes';
import useMainLayoutContext from '../../Hooks/useMainLayoutContext';

interface SearchComponentProps {
  id: string;
  label: string;
  width: number;
  disabled: boolean;
  value: string | undefined;
  setValue: (value: unknown) => void;
  type: string;
}

export default function SearchComponent({
  id,
  label,
  width,
  value,
  setValue,
  disabled,
  type,
}: SearchComponentProps) {
  const [options, setOptions] = useState<Array<string>>([]);

  const { showToastMessage } = useMainLayoutContext();

  async function fetchClients() {
    try {
      const { data } = await api.get('Cliente');

      const names = data.map(
        (client: ClientProps) => client.client_id + ' - ' + client.name
      );

      setOptions(names);
    } catch (error) {
      showToastMessage('Erro ao buscar clientes:' + error);
    }
  }

  async function fetchRecipes() {
    try {
      const { data } = await api.get('Receita');

      const names = data.map(
        (recipe: RecipeProps) => recipe.recipe_id + ' - ' + recipe.description
      );

      setOptions(names);
    } catch (error) {
      showToastMessage('Erro ao buscar receitas:' + error);
    }
  }

  useEffect(() => {
    if (type === 'client') {
      fetchClients();
    } else if (type === 'recipe') {
      fetchRecipes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
