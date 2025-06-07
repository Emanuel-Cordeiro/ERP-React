import { useEffect, useState } from 'react';

import { AxiosError, isAxiosError } from 'axios';
import { Controller, useForm } from 'react-hook-form';

import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';

import api from '../../Services/api';
import { ApiError } from '../../Types/common';
import Input from '../../Components/TextField';
import ButtonForm from '../../Components/ButtonForm';
import { SelectInput } from '../../Components/SelectInput';
import useMainLayoutContext from '../../Hooks/useMainLayoutContext';
import {
  GridContainer,
  PageContainer,
  PageTitle,
} from '../../Components/StyleComponents';

interface IngredientProps {
  id?: number;
  ingredient_id?: number;
  description: string;
  unity: string;
  cost: number;
  stock: number;
}

const formDefault = {
  id: 0,
  ingredient_id: 0,
  description: '',
  unity: '',
  cost: 0,
  stock: 0,
};

export default function Ingredients() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [dataGridRows, setDataGridRows] = useState<IngredientProps[]>([]);
  const [isLoadingButton, setIsLoadingButton] = useState(false);

  const {
    showToastMessage,
    setDialogInfo,
    setDialogHandleButtonAction,
    setShowDialog,
    handleFormError,
  } = useMainLayoutContext();

  const { control, getValues, reset, handleSubmit, formState } =
    useForm<IngredientProps>({ defaultValues: formDefault });

  const dataGridColumns: GridColDef<(typeof dataGridRows)[number]>[] = [
    { field: 'id', headerName: 'Id', width: 10 },
    { field: 'ingredient_id', headerName: 'Código', width: 70 },
    { field: 'description', headerName: 'Descrição', width: 300 },
    { field: 'unity', headerName: 'Unidade', width: 100 },
    { field: 'cost', headerName: 'Custo', width: 100 },
    { field: 'stock', headerName: 'Estoque', width: 100 },
  ];

  //API Communication
  async function loadIngredients(ingredientId?: number) {
    try {
      setIsLoading(true);

      const { data } = await api.get('Ingrediente');

      const rows = data.map((ingredient: IngredientProps, index: number) => ({
        id: index + 1,
        ingredient_id: ingredient.ingredient_id,
        description: ingredient.description,
        unity: ingredient.unity,
        cost: ingredient.cost,
        stock: ingredient.stock,
      }));

      setDataGridRows(rows);

      let ingredientIndexInGrid = rows.findIndex(
        (item: IngredientProps) => item.ingredient_id === ingredientId
      );

      if (ingredientIndexInGrid === -1) ingredientIndexInGrid = 0;

      reset({
        ...rows[ingredientIndexInGrid],
      });
    } catch (error) {
      showToastMessage('Erro: ' + error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegisterIngredient() {
    try {
      setIsLoadingButton(true);

      const formData = { ...getValues() };

      if (isNewRecord) delete formData.ingredient_id;

      const { status, data } = await api.post('Ingrediente', formData);

      if (status === 200 || status === 201) {
        loadIngredients(data.id);
        setIsEditable(false);
        setIsNewRecord(false);
        showToastMessage(
          `Cadastro ${status === 201 ? 'realizado' : 'alterado'} com sucesso.`
        );
      }
    } catch (error) {
      showToastMessage('Erro: ' + error);
    } finally {
      setIsLoadingButton(false);
    }
  }

  async function handleDeleteIngredient() {
    const ingredientId = getValues('ingredient_id');

    try {
      setIsLoadingButton(true);

      const res = await api.delete(`Ingrediente/${ingredientId}`);

      if (res.status === 204) {
        const selectedIngredientIndex = dataGridRows.findIndex(
          (ingredient) => ingredient.ingredient_id === ingredientId
        );

        const updatedList = dataGridRows.filter(
          (item) => item.ingredient_id !== ingredientId
        );

        setDataGridRows(updatedList);

        reset(updatedList[selectedIngredientIndex - 1] || formDefault);

        showToastMessage('Exclusão realizada com sucesso.');
      }
    } catch (error) {
      if (isAxiosError<ApiError>(error)) {
        const axiosError: AxiosError<ApiError> = error;

        const errorMessage = axiosError.response?.data?.error;

        showToastMessage('Erro: ' + errorMessage);
      } else {
        showToastMessage('Erro: ' + String(error));
      }
    } finally {
      setIsLoadingButton(false);
      setShowDialog(false);
    }
  }

  // Form handling
  function handleAskDeleteIngredient() {
    setDialogInfo({
      dialogTitle: 'Cadastro de Ingredientes',
      dialogText: 'Excluir esse ingrediente?',
      dialogButtonText: 'Excluir',
    });

    setDialogHandleButtonAction(() => handleDeleteIngredient);
    setShowDialog(true);
  }

  function handleAddClient() {
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
      const selectedIngredientIndex = dataGridRows.findIndex(
        (ingredient) => ingredient.ingredient_id === getValues('ingredient_id')
      );

      reset({
        ...dataGridRows[selectedIngredientIndex],
      });
    }

    setIsEditable(false);
    setIsNewRecord(false);
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
      <PageTitle>Ingredientes</PageTitle>

      <PageContainer>
        <Controller
          name="ingredient_id"
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
          name="unity"
          control={control}
          rules={{ required: 'A unidade é obrigatória.' }}
          render={({ field: { value, onChange } }) => (
            <SelectInput
              label={'Unidade'}
              id="unity"
              width={78}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />

        <Controller
          name="cost"
          control={control}
          rules={{ min: { value: 1, message: 'Custo não pode ser zero' } }}
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
      </PageContainer>

      <PageContainer>
        {isEditable ? (
          <>
            <ButtonForm
              title="Gravar"
              handleFunction={handleSubmit(handleRegisterIngredient, () =>
                handleFormError(formState)
              )}
              loading={isLoadingButton}
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
              handleFunction={handleAskDeleteIngredient}
              loading={isLoadingButton}
            />
          </>
        )}
      </PageContainer>

      <GridContainer>
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
      </GridContainer>
    </>
  );
}
