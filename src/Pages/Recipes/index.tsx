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
import ItensDataGrid from '../../Components/ItensDataGrid';

interface RecipeIngredientProps {
  ingredient_id?: number;
  description: string;
  quantity: number;
}

export interface RecipeProps {
  id?: number;
  recipe_id: number;
  description: string;
  cost: number;
  itens: Array<RecipeIngredientProps>;
}

const formDefault = {
  id: 0,
  recipe_id: 0,
  description: '',
  cost: 0,
  itens: [],
};

export default function Recipes() {
  const form = useForm<RecipeProps>({ defaultValues: formDefault });
  const { control, getValues, reset, handleSubmit, formState } = form;

  const [isEditable, setIsEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [shouldDeleteItem, setShouldDeleteItem] = useState(false);
  const [snackBarErrorMessage, setSnackBarErrorMessage] = useState('');
  const [dataGridRows, setDataGridRows] = useState<RecipeProps[]>([]);

  const dataGridColumns: GridColDef<(typeof dataGridRows)[number]>[] = [
    { field: 'recipe_id', headerName: 'Código', width: 70 },
    { field: 'description', headerName: 'Descrição', width: 300 },
    { field: 'cost', headerName: 'Custo', width: 100, editable: true },
  ];

  // form handling
  async function handleEditRecipe() {
    const id = getValues('recipe_id');
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
    try {
      setIsLoading(true);

      const { data } = await api.get('Receita');

      const rows = data.map((item: RecipeProps, index: number) => ({
        id: index + 1,
        recipe_id: item.recipe_id,
        description: item.description,
        cost: item.cost,
      }));

      setDataGridRows(rows);

      reset(rows[0]);
    } catch (error) {
      showErrorMessage(String(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteRecipe() {
    const id = getValues('recipe_id');

    try {
      const res = await api.delete(`Receita/${id}`);

      if (res.status === 201) {
        let selectedItemIndex = dataGridRows.findIndex(
          (item) => item.recipe_id === id
        );

        if (selectedItemIndex !== -1) selectedItemIndex = 0;

        const updatedList = dataGridRows.filter(
          (item) => item.recipe_id !== id
        );

        reset({
          ...updatedList[selectedItemIndex - 1],
        });

        setDataGridRows(updatedList);
      }

      setShouldDeleteItem(false);
    } catch (error) {
      showErrorMessage(error);
    }
  }

  async function handleRegisterRecipe() {
    try {
      setIsLoadingButton(true);

      let formData;

      if (isNewRecord) {
        formData = getValues();

        delete formData.id;
      } else {
        formData = getValues();
      }

      const { status } = await api.post('Receita', formData);

      if (status === 200 || status === 201) {
        loadRecipes();
        setIsEditable(false);
        setIsNewRecord(false);
      }
    } catch (error) {
      showErrorMessage(error);
    } finally {
      setIsNewRecord(false);
      setIsEditable(false);
      setIsLoadingButton(false);
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
          name="recipe_id"
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
          rules={{ required: 'A descrição é obrigatória.' }}
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
              loading={isLoadingButton}
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
              loading={isLoadingButton}
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
            loading={isLoading}
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
