import { useEffect, useState } from 'react';

import { Controller, FormProvider, useForm } from 'react-hook-form';

import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';

import api from '../../Services/api';
import Input from '../../Components/TextField';
import ButtonForm from '../../Components/ButtonForm';
import ItensDataGrid from '../../Components/ItensDataGrid';
import useMainLayoutContext from '../../Hooks/useMainLayoutContext';

interface RecipeIngredientProps {
  ingredient_id?: number;
  description: string;
  quantity: number;
  cost: number;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [dataGridRows, setDataGridRows] = useState<RecipeProps[]>([]);
  const [isLoadingButton, setIsLoadingButton] = useState(false);

  const {
    showToastMessage,
    setDialogInfo,
    setDialogHandleButtonAction,
    setShowDialog,
    handleFormError,
  } = useMainLayoutContext();

  const form = useForm<RecipeProps>({ defaultValues: formDefault });
  const { control, getValues, reset, handleSubmit, formState } = form;

  const dataGridColumns: GridColDef<(typeof dataGridRows)[number]>[] = [
    { field: 'recipe_id', headerName: 'Código', width: 70 },
    { field: 'description', headerName: 'Descrição', width: 300 },
    { field: 'cost', headerName: 'Custo', width: 100, editable: true },
  ];

  // API Communication
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
      showToastMessage('Erro: ' + error);
    } finally {
      setIsLoading(false);
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

      let cost = 0;

      if (formData.itens.length === 0)
        throw new Error('É obrigatório informar itens.');

      for (let i = 0; i < formData.itens.length; i++) {
        cost += formData.itens[i].cost * formData.itens[i].quantity;
      }

      formData.cost = cost;

      const { status } = await api.post('Receita', formData);

      if (status === 200 || status === 201) {
        loadRecipes();
        setIsEditable(false);
        setIsNewRecord(false);
        showToastMessage('Cadastro realizado com sucesso.');
      }
    } catch (error) {
      showToastMessage('Erro: ' + error);
    } finally {
      setIsLoadingButton(false);
    }
  }

  async function handleDeleteRecipe() {
    const recipeId = getValues('recipe_id');

    try {
      const res = await api.delete(`Receita/${recipeId}`);

      if (res.status === 204) {
        const updatedList = dataGridRows.filter(
          (item) => item.recipe_id !== recipeId
        );

        setDataGridRows(updatedList);

        const selectedItemIndex = dataGridRows.findIndex(
          (item) => item.recipe_id === getValues('recipe_id')
        );

        reset({
          ...(updatedList[selectedItemIndex - 1] || formDefault),
        });
      }
    } catch (error) {
      showToastMessage('Erro: ' + error);
    } finally {
      setIsLoadingButton(false);
      setShowDialog(false);
      showToastMessage('Exclusão realizada com sucesso.');
    }
  }

  async function handleEditRecipe() {
    const id = getValues('recipe_id');

    try {
      const { data } = await api.get(`Receita/${id}`);

      reset(data);

      setIsEditable(true);
    } catch (error) {
      showToastMessage('Erro: ' + error);
    } finally {
      setIsLoadingButton(false);
    }
  }

  // Form handling
  function handleAskDeleteRecipe() {
    setDialogInfo({
      dialogTitle: 'Cadastro de Receitas',
      dialogText: 'Excluir esse Receita?',
      dialogButtonText: 'Excluir',
    });

    setDialogHandleButtonAction(() => handleDeleteRecipe);
    setShowDialog(true);
  }

  function handleAddRecipe() {
    reset(formDefault);

    setIsNewRecord(true);
    setIsEditable(true);
  }

  function handleCancelEdit() {
    if (isNewRecord) {
      reset({
        ...dataGridRows[0],
      });
    } else {
      const selectedItemIndex = dataGridRows.findIndex(
        (item) => item.id === getValues('id')
      );

      reset({
        ...dataGridRows[selectedItemIndex],
      });
    }

    setIsEditable(false);
    setIsNewRecord(false);
  }

  function handleRowClick(params: GridRowParams) {
    const selectedItem = dataGridRows.find((item) => item.id === params.row.id);

    reset({ ...selectedItem });
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
              handleFunction={handleSubmit(handleRegisterRecipe, () =>
                handleFormError(formState)
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
              handleFunction={handleAskDeleteRecipe}
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
    </FormProvider>
  );
}
