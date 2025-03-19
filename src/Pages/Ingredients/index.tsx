import { useEffect, useState } from 'react';

import { Controller, useForm } from 'react-hook-form';

import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  Snackbar,
} from '@mui/material';

import api from '../../Services/api';
import Input from '../../Components/TextField';
import ButtonForm from '../../Components/ButtonForm';

interface IngredientProps {
  id?: number;
  description: string;
  unity: string;
  cost: number;
  stock: number;
}

const formDefault = {
  id: 0,
  description: '',
  unity: '',
  cost: 0,
  stock: 0,
};

export default function Ingredients() {
  const { control, getValues, reset, handleSubmit, formState } =
    useForm<IngredientProps>({});
  const [isEditable, setIsEditable] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [shouldDeleteItem, setShouldDeleteItem] = useState(false);
  const [snackBarErrorMessage, setSnackBarErrorMessage] = useState('');
  const [dataGridRows, setDataGridRows] = useState<IngredientProps[]>([]);

  const dataGridColumns: GridColDef<(typeof dataGridRows)[number]>[] = [
    { field: 'id', headerName: 'Código', width: 70 },
    { field: 'description', headerName: 'Descrição', width: 300 },
    { field: 'unity', headerName: 'Unidade', width: 100 },
    { field: 'cost', headerName: 'Custo', width: 100 },
    { field: 'stock', headerName: 'Estoque', width: 100 },
  ];

  async function loadIngredients() {
    const { data } = await api.get('Ingrediente');

    const rows = data.map((ingredient: IngredientProps) => ({
      id: ingredient.id,
      description: ingredient.description,
      unity: ingredient.unity,
      cost: ingredient.cost,
      stock: ingredient.stock,
    }));

    setDataGridRows(rows);

    reset(rows[0]);
  }

  function handleAddClient() {
    reset(formDefault);

    setIsNewRecord(true);
    setIsEditable(true);
  }

  function handleCancelEdit() {
    const selectedIngredientIndex = dataGridRows.findIndex(
      (ingredient) => ingredient.id === getValues('id')
    );

    reset({
      ...dataGridRows[selectedIngredientIndex],
    });

    setIsEditable(false);
    setIsNewRecord(false);
  }

  async function handleRegisterIngredient() {
    try {
      const formData = { ...getValues() };

      if (isNewRecord) delete formData.id;

      const { status, statusText } = await api.post('Ingrediente', formData);

      if (status === 201) {
        loadIngredients();

        setIsEditable(false);
        setIsNewRecord(false);
      }

      if (status === 500) {
        console.log(statusText);
      }
    } catch (error) {
      showErrorMessage(error);
    }
  }

  async function handleDeleteIngredient() {
    const id = getValues('id');

    try {
      const res = await api.delete(`Ingrediente/${id}`);

      if (res.status === 201) {
        const updatedList = dataGridRows.filter((item) => item.id !== id);

        setDataGridRows(updatedList);

        const selectedIngredientIndex = dataGridRows.findIndex(
          (ingredient) => ingredient.id === getValues('id')
        );

        reset({
          ...updatedList[selectedIngredientIndex - 1],
        });
      }

      setShouldDeleteItem(false);
    } catch (error) {
      showErrorMessage(error);
    }
  }

  function showErrorMessage(error: unknown) {
    setSnackBarErrorMessage(String(error));

    setTimeout(() => setSnackBarErrorMessage(''), 5000);
  }

  function handleFormError() {
    const error = Object.values(formState.errors)[0];

    showErrorMessage(String(error!.message));
  }

  function handleRowClick(params: GridRowParams) {
    const selectedIngredient = dataGridRows.find(
      (ingredient) => ingredient.id === params.row.id
    );

    reset({
      ...selectedIngredient,
    });
  }

  useEffect(() => {
    loadIngredients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h1 style={{ marginLeft: '250px', color: 'var(--font)' }}>
        Ingredientes
      </h1>

      <div
        style={{
          marginLeft: '250px',
          display: 'flex',
          flex: 1,
        }}
      >
        <Controller
          name="id"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              id="id"
              label="Código"
              width={100}
              value={value}
              setValue={onChange}
              disabled
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              id="description"
              label="Descrição"
              width={500}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />

        <Controller
          name="unity"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              id="unity"
              label="Unidade"
              width={80}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />

        <Controller
          name="cost"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              id="cost"
              label="Custo"
              width={90}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />

        <Controller
          name="stock"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              id="stock"
              label="Estoque"
              width={90}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />
      </div>

      <div
        style={{
          marginLeft: '250px',
          display: 'flex',
          flex: 1,
        }}
      >
        {isEditable ? (
          <>
            <ButtonForm
              title="Gravar"
              handleFunction={handleSubmit(
                handleRegisterIngredient,
                handleFormError
              )}
            />

            <ButtonForm title="Cancelar" handleFunction={handleCancelEdit} />
          </>
        ) : (
          <>
            <ButtonForm title="Incluir" handleFunction={handleAddClient} />

            <ButtonForm
              title="Alterar"
              handleFunction={() => setIsEditable(true)}
            />

            <ButtonForm
              title="Excluir"
              handleFunction={() => setShouldDeleteItem(true)}
            />
          </>
        )}
      </div>

      <div
        style={{
          marginLeft: '250px',
          display: 'flex',
          flex: 1,
          marginTop: '20px',
        }}
      >
        <DataGrid
          rows={dataGridRows}
          columns={dataGridColumns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
          onRowClick={handleRowClick}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              color: 'black',
              fontSize: '16px',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-cell': {
              color: 'var(--font)',
            },
            '& .MuiTablePagination-toolbar': {
              color: 'var(--font)',
            },
          }}
        />
      </div>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={snackBarErrorMessage !== ''}
        message={snackBarErrorMessage}
        TransitionComponent={Slide}
        ContentProps={{
          sx: {
            backgroundColor: 'red',
            flex: 1,
          },
        }}
      />

      <Dialog open={shouldDeleteItem}>
        <DialogTitle>Cadastro de Ingredientes</DialogTitle>
        <DialogContent>
          <DialogContentText>Excluir esse ingrediente?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShouldDeleteItem(false)}>Não</Button>
          <Button onClick={handleDeleteIngredient} autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
