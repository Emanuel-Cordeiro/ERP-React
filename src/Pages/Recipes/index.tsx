import { useEffect, useState } from 'react';

import { Controller, FormProvider, useForm } from 'react-hook-form';

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
import { ItensDataGrid } from '../../Components/ItensDataGrid';

interface RecipeIngredientProps {
  id?: number;
  description: string;
  quantity: number;
}

export interface RecipeProps {
  id?: number;
  description: string;
  cost: number;
  itens?: Array<RecipeIngredientProps>;
}

const formDefault = {
  id: 0,
  description: '',
  cost: 0,
  itens: [],
};

export default function Recipes() {
  const form = useForm<RecipeProps>({ defaultValues: formDefault });
  const { control, getValues, reset, handleSubmit, formState } = form;

  const [isEditable, setIsEditable] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [shouldDeleteItem, setShouldDeleteItem] = useState(false);
  const [snackBarErrorMessage, setSnackBarErrorMessage] = useState('');
  const [dataGridRows, setDataGridRows] = useState<RecipeProps[]>([]);

  const dataGridColumns: GridColDef<(typeof dataGridRows)[number]>[] = [
    { field: 'id', headerName: 'Código', width: 70 },
    { field: 'description', headerName: 'Descrição', width: 300 },
    { field: 'cost', headerName: 'Custo', width: 100, editable: true },
  ];

  // form handling
  async function handleEditRecipe() {
    const id = getValues('id');
    const { data } = await api.get(`Receita/${id}`);

    reset(data);

    setIsEditable(true);
  }

  function handleAddRecipe() {
    reset(formDefault);

    setIsNewRecord(true);
    setIsEditable(true);
  }

  function handleCancelEdit() {
    const selectedItemIndex = dataGridRows.findIndex(
      (item) => item.id === getValues('id')
    );

    reset({
      ...dataGridRows[selectedItemIndex],
    });

    setIsEditable(false);
    setIsNewRecord(false);
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
    const selectedItem = dataGridRows.find((item) => item.id === params.row.id);

    reset({ ...selectedItem });
  }

  //api communication
  async function loadRecipes() {
    const { data } = await api.get('Receita');

    const rows = data.map((item: RecipeProps) => ({
      id: item.id,
      description: item.description,
      cost: item.cost,
    }));

    setDataGridRows(rows);

    reset(rows[0]);
  }

  async function handleDeleteRecipe() {
    const id = getValues('id');

    try {
      const res = await api.delete(`Receita/${id}`);

      if (res.status === 201) {
        const updatedList = dataGridRows.filter((item) => item.id !== id);

        setDataGridRows(updatedList);

        const selectedItemIndex = dataGridRows.findIndex(
          (item) => item.id === getValues('id')
        );

        reset({
          ...updatedList[selectedItemIndex - 1],
        });
      }

      setShouldDeleteItem(false);
    } catch (error) {
      showErrorMessage(error);
    }
  }

  async function handleRegisterRecipe() {
    try {
      const formData = { ...getValues() };
      const itens = formData?.itens?.map((i) => ({
        ...i,
        ingredient_id: i.id,
      }));

      if (itens) delete formData.itens;

      const finalForm = { ...formData, itens: itens };

      if (isNewRecord) delete finalForm.id;

      const { status } = await api.post('Receita', finalForm);

      if (status === 200 || status === 201) {
        loadRecipes();
        setIsEditable(false);
        setIsNewRecord(false);
      }
    } catch (error) {
      showErrorMessage(error);
    }
  }

  useEffect(() => {
    loadRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormProvider {...form}>
      <h1 style={{ marginLeft: '250px', color: 'var(--font)' }}>Receitas</h1>

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
          name="cost"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              id="cost"
              label="Custo"
              width={80}
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
                handleRegisterRecipe,
                handleFormError
              )}
            />

            <ButtonForm title="Cancelar" handleFunction={handleCancelEdit} />
          </>
        ) : (
          <>
            <ButtonForm title="Incluir" handleFunction={handleAddRecipe} />

            <ButtonForm title="Alterar" handleFunction={handleEditRecipe} />

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
        {isEditable ? (
          <ItensDataGrid />
        ) : (
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
        )}
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
        <DialogTitle>Cadastro de Receitas</DialogTitle>
        <DialogContent>
          <DialogContentText>Excluir essa receita?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShouldDeleteItem(false)}>Não</Button>
          <Button onClick={handleDeleteRecipe} autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}
